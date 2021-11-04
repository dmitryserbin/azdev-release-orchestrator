import { Build, StageUpdateType, Timeline, TimelineRecord, TimelineRecordState, UpdateStageParameters } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IStageSelector } from "./istageselector";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildTask } from "../../workers/progressmonitor/ibuildtask";
import { IBuildApproval } from "../../workers/progressmonitor/ibuildapproval";
import { IBuildCheck } from "../../workers/progressmonitor/ibuildcheck";
import { IBuildCheckpoint } from "../../workers/progressmonitor/ibuildcheckpoint";
import { IPipelinesApiRetry } from "../../extensions/pipelinesapiretry/ipipelineapiretry";
import { ICommonHelper } from "../commonhelper/icommonhelper";

export class StageSelector implements IStageSelector {

    private debugLogger: IDebug;

    private buildApi: IBuildApiRetry;
    private pipelinesApi: IPipelinesApiRetry;
    private commonHelper: ICommonHelper;

    constructor(buildApi: IBuildApiRetry, pipelinesApi: IPipelinesApiRetry, commonHelper: ICommonHelper, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.buildApi = buildApi;
        this.pipelinesApi = pipelinesApi;
        this.commonHelper = commonHelper;

    }

    public async getStage(build: Build, stage: IBuildStage): Promise<IBuildStage> {

        const debug = this.debugLogger.extend(this.getStage.name);

        const buildTimeline: Timeline = await this.buildApi.getBuildTimeline(build.project!.name!, build.id!, build.orchestrationPlan!.planId);

        if (!buildTimeline) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build timeline`);

        }

        const stageTimeline: TimelineRecord | undefined = this.getTimelineRecord(buildTimeline, stage.name, `Stage`);

        if (!stageTimeline) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build stage <${stage.name}> timeline`);

        }

        // Target stage ID changes with every new run
        // Re-assigning to support stage re-deployment
        stage.id = stageTimeline.id!;

        stage.startTime = stageTimeline.startTime!;
        stage.finishTime = stageTimeline.finishTime!;
        stage.state = stageTimeline.state!;
        stage.result = stageTimeline.result!;
        stage.approvals = [];
        stage.checks = [];
        stage.jobs = [];
        stage.attempt.stage = stageTimeline.attempt!;

        const stageCheckpoint: TimelineRecord | undefined = this.getChildTimelineRecord(buildTimeline, stageTimeline.id!, `Checkpoint`);

        if (stageCheckpoint) {

            stage.checkpoint = this.newBuildCheckpoint(stageCheckpoint);
            stage.approvals = this.newBuildApprovals(buildTimeline, stageCheckpoint);
            stage.checks = this.newBuildChecks(buildTimeline, stageCheckpoint);

        }

        const stagePhases: TimelineRecord[] = this.getChildTimelineRecords(buildTimeline, stageTimeline.id!, `Phase`);

        if (stagePhases.length) {

            stage.jobs = this.newBuildJobs(buildTimeline, stagePhases);

        }

        debug(stage);

        return stage;

    }

    public async startStage(build: Build, stage: IBuildStage, confirm: boolean): Promise<void> {

        const debug = this.debugLogger.extend(this.startStage.name);

        debug(`Starting <${stage.name}> (${stage.id}) stage progress`);

        const retryRequest: UpdateStageParameters = {

            forceRetryAllJobs: true,
            state: StageUpdateType.Retry,

        };

        await this.buildApi.updateStage(retryRequest, build.id!, stage.name, build.project?.name);

        // Confirm stage progress initialized
        // Otherwise it may report completed
        if (confirm) {

            const maxAttempts: number = 10;

            let started: boolean = false;
            let attempt: number = 0;

            do {

                attempt++;

                if (attempt > maxAttempts) {

                    throw new Error(`Unable to start <${stage.name}> (${stage.id}) stage progress`);

                }

                debug(`Validating <${stage.name}> (${stage.id}) stage start (sttempt ${attempt})`);

                await this.commonHelper.wait(10000);

                stage = await this.getStage(build, stage);

                if (stage.state !== TimelineRecordState.Completed) {

                    debug(`Stage <${stage.name}> (${stage.id}) successfully started`);

                    started = true;

                }

            } while (!started);

        }

    }

    public async approveStage(build: Build, approval: IBuildApproval, comment?: string): Promise<unknown> {

        const debug = this.debugLogger.extend(this.approveStage.name);

        const request: unknown = {

            approvalId: approval.id,
            status: `approved`,
            comment: comment ? comment : ``,

        };

        const approvalResult: unknown = await this.pipelinesApi.updateApproval(build, request);

        debug(approvalResult);

        return approvalResult;

    }

    public async confirmStage(stage: IBuildStage): Promise<void> {

        const skipped: boolean = stage.result === 4 ? true : false;
        const pending: boolean = stage.state === 0 && stage.checkpoint === null ? true : false;

        if (skipped) {

            throw new Error(`Target stage <${stage.name}> (${stage.id}) is skipped`);

        }

        if (pending) {

            throw new Error(`Target stage <${stage.name}> (${stage.id}) is pending dependencies`);

        }

    }

    private getTimelineRecord(timeline: Timeline, name: string, type: string): TimelineRecord | undefined {

        const timelineRecord: TimelineRecord | undefined = timeline.records!.find(
            (record: TimelineRecord) => record.name === name && record.type === type);

        return timelineRecord;

    }

    private getChildTimelineRecord(timeline: Timeline, parrentId: string, type: string): TimelineRecord | undefined {

        const timelineRecord: TimelineRecord | undefined = timeline.records!.find(
            (record: TimelineRecord) => record.parentId === parrentId && record.type === type);

        return timelineRecord;

    }

    private getChildTimelineRecords(timeline: Timeline, parentId: string, type: string): TimelineRecord[] {

        const timelineRecords: TimelineRecord[] = timeline.records!.filter(
            (record: TimelineRecord) => record.parentId === parentId && record.type === type).sort(
                (left, right) => left.order! - right.order!);

        return timelineRecords;

    }

    private newBuildJobs(timeline: Timeline, stagePhases: TimelineRecord[]): IBuildJob[] {

        const result: IBuildJob[] = [];

        for (const phase of stagePhases) {

            const phaseJobs: TimelineRecord[] = this.getChildTimelineRecords(timeline, phase.id!, `Job`);

            for (const job of phaseJobs) {

                const jobStatus: IBuildJob = this.newBuildJob(job);

                const jobTasks: TimelineRecord[] = this.getChildTimelineRecords(timeline, job.id!, `Task`);

                for (const task of jobTasks) {

                    const taskStatus: IBuildTask = this.newBuildTask(task);

                    jobStatus.tasks.push(taskStatus);

                }

                result.push(jobStatus);

            }

        }

        return result;

    }

    private newBuildCheckpoint(timelineRecord: TimelineRecord): IBuildCheckpoint {

        const buildCheckpoint: IBuildCheckpoint = {

            id: timelineRecord.id!,
            state: timelineRecord.state!,
            result: timelineRecord.result!,

        };

        return buildCheckpoint;

    }

    private newBuildApprovals(timeline: Timeline, stageCheckpoint: TimelineRecord): IBuildApproval[] {

        const result: IBuildApproval[] = [];

        const stageApprovalTimelines: TimelineRecord[] = this.getChildTimelineRecords(timeline, stageCheckpoint.id!, `Checkpoint.Approval`);

        for (const approval of stageApprovalTimelines) {

            const buildApproval: IBuildApproval = this.newBuildApproval(approval);

            result.push(buildApproval);

        }

        return result;

    }

    private newBuildChecks(timeline: Timeline, stageCheckpoint: TimelineRecord): IBuildApproval[] {

        const result: IBuildCheck[] = [];

        const stageCheckTimelines: TimelineRecord[] = this.getChildTimelineRecords(timeline, stageCheckpoint.id!, `Checkpoint.TaskCheck`);

            for (const check of stageCheckTimelines) {

                const buildCheck: IBuildCheck = this.newBuildCheck(check);

                result.push(buildCheck);

            }

        return result;

    }

    private newBuildJob(timelineRecord: TimelineRecord): IBuildJob {

        const buildJob: IBuildJob = {

            id: timelineRecord.id!,
            name: timelineRecord.name!,
            workerName: timelineRecord.workerName!,
            startTime: timelineRecord.startTime!,
            finishTime: timelineRecord.finishTime!,
            state: timelineRecord.state!,
            result: timelineRecord.result!,
            tasks: [],

        };

        return buildJob;

    }

    private newBuildTask(timelineRecord: TimelineRecord): IBuildTask {

        const buildTask: IBuildTask = {

            id: timelineRecord.id!,
            name: timelineRecord.name!,
            startTime: timelineRecord.startTime!,
            finishTime: timelineRecord.finishTime!,
            state: timelineRecord.state!,
            result: timelineRecord.result!,

        };

        return buildTask;

    }

    private newBuildApproval(timelineRecord: TimelineRecord): IBuildApproval {

        const buildApproval: IBuildApproval = {

            id: timelineRecord.id!,
            state: timelineRecord.state!,
            result: timelineRecord.result!,

        };

        return buildApproval;

    }

    private newBuildCheck(timelineRecord: TimelineRecord): IBuildCheck {

        const buildCheck: IBuildCheck = {

            id: timelineRecord.id!,
            state: timelineRecord.state!,
            result: timelineRecord.result!,

        };

        return buildCheck;

    }

}
