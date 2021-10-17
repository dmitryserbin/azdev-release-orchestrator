/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, Timeline, TimelineRecord, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IBuildMonitor } from "./ibuildmonitor";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildTask } from "../../workers/progressmonitor/ibuildtask";

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

        const stage: TimelineRecord | undefined = timeline.records!.find(
            (record: TimelineRecord) => record.name === name && record.type === "Stage");

        if (!stage) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build stage <${name}> timeline`);

        }

        const stageCheckpoint: TimelineRecord | undefined = timeline.records!.find(
            (record: TimelineRecord) => record.parentId === stage.id && record.type === "Checkpoint");

        const stageStatus: IBuildStage = this.newBuildStage(stage, stageCheckpoint);

        const stagePhases: TimelineRecord[] = this.filterTimelineRecords(timeline, stage.id!, "Phase");

        for (const phase of stagePhases) {

            const phaseJobs: TimelineRecord[] = this.filterTimelineRecords(timeline, phase.id!, "Job");

            for (const job of phaseJobs) {

                const jobStatus: IBuildJob = this.newBuildJob(job);

                const jobTasks: TimelineRecord[] = this.filterTimelineRecords(timeline, job.id!, "Task");

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

    private filterTimelineRecords(timeline: Timeline, parentId: string, type: string): TimelineRecord[] {

        const timelineRecords: TimelineRecord[] = timeline.records!.filter(
            (record: TimelineRecord) => record.parentId === parentId && record.type === type).sort(
                (left, right) => left.order! - right.order!);

        return timelineRecords;

    }

    private newBuildStage(timelineRecord: TimelineRecord, stageCheckpoint?: TimelineRecord): IBuildStage {

        const buildStage: IBuildStage = {

            id: timelineRecord.id!,
            name: timelineRecord.name!,
            startTime: timelineRecord.startTime!,
            finishTime: timelineRecord.finishTime!,
            attempt: timelineRecord.attempt!,
            state: timelineRecord.state!,
            result: timelineRecord.result!,
            checks: (stageCheckpoint && stageCheckpoint.state !== TimelineRecordState.Completed) ? true : false,
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

}
