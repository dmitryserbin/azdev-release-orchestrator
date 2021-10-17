/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, Timeline, TimelineRecord } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IBuildMonitor } from "./ibuildmonitor";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildTask } from "../../workers/progressmonitor/ibuildtask";
import { IBuildApproval } from "../../workers/progressmonitor/ibuildapproval";
import { IBuildCheck } from "../../workers/progressmonitor/ibuildcheck";
import { IBuildCheckpoint } from "../../workers/progressmonitor/ibuildcheckpoint";

export class BuildMonitor implements IBuildMonitor {

    private debugLogger: IDebug;

    private buildApi: IBuildApiRetry;

    constructor(buildApi: IBuildApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.buildApi = buildApi;

    }

    public async getStageStatus(build: Build, name: string): Promise<IBuildStage> {

        const debug = this.debugLogger.extend(this.getStageStatus.name);

        const timeline: Timeline = await this.buildApi.getBuildTimeline(build.project!.name!, build.id!, build.orchestrationPlan!.planId);

        if (!timeline) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build timeline`);

        }

        const stage: TimelineRecord | undefined = this.getTimelineRecord(timeline, name, `Stage`);

        if (!stage) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build stage <${name}> timeline`);

        }

        const stageStatus: IBuildStage = this.newBuildStage(stage);

        const stageCheckpoint: TimelineRecord | undefined = this.getChildTimelineRecord(timeline, stage.id!, `Checkpoint`);

        if (stageCheckpoint) {

            stageStatus.checkpoint = this.newBuildCheckpoint(stageCheckpoint);

            const stageApprovals: TimelineRecord[] = this.getChildTimelineRecords(timeline, stageCheckpoint.id!, "Checkpoint.Approval");

            for (const approval of stageApprovals) {

                const buildApproval: IBuildApproval = this.newBuildApproval(approval);

                stageStatus.approvals.push(buildApproval);

            }

            const stageChecks: TimelineRecord[] = this.getChildTimelineRecords(timeline, stageCheckpoint.id!, "Checkpoint.TaskCheck");

            for (const check of stageChecks) {

                const buildCheck: IBuildCheck = this.newBuildCheck(check);

                stageStatus.checks.push(buildCheck);

            }

        }

        const stagePhases: TimelineRecord[] = this.getChildTimelineRecords(timeline, stage.id!, "Phase");

        for (const phase of stagePhases) {

            const phaseJobs: TimelineRecord[] = this.getChildTimelineRecords(timeline, phase.id!, "Job");

            for (const job of phaseJobs) {

                const jobStatus: IBuildJob = this.newBuildJob(job);

                const jobTasks: TimelineRecord[] = this.getChildTimelineRecords(timeline, job.id!, "Task");

                for (const task of jobTasks) {

                    const taskStatus: IBuildTask = this.newBuildTask(task);

                    jobStatus.tasks.push(taskStatus);

                }

                stageStatus.jobs.push(jobStatus);

            }

        }

        debug(stageStatus);

        return stageStatus;

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

    private newBuildStage(timelineRecord: TimelineRecord): IBuildStage {

        const buildStage: IBuildStage = {

            id: timelineRecord.id!,
            name: timelineRecord.name!,
            startTime: timelineRecord.startTime!,
            finishTime: timelineRecord.finishTime!,
            attempt: timelineRecord.attempt!,
            state: timelineRecord.state!,
            result: timelineRecord.result!,
            checkpoint: null,
            approvals: [],
            checks: [],
            jobs: [],

        };

        return buildStage;

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

    private newBuildCheckpoint(timelineRecord: TimelineRecord): IBuildCheckpoint {

        const buildCheckpoint: IBuildCheckpoint = {

            id: timelineRecord.id!,
            state: timelineRecord.state!,
            result: timelineRecord.result!,

        };

        return buildCheckpoint;

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
