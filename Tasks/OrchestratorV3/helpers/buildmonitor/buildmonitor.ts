/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, Timeline, TimelineRecord } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IBuildMonitor } from "./ibuildmonitor";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildTask } from "../../workers/progressmonitor/ibuildtask";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";

export class BuildMonitor implements IBuildMonitor {

    private debugLogger: IDebug;

    private buildApi: IBuildApiRetry;
    private runApi: IRunApiRetry;

    constructor(buildApi: IBuildApiRetry, runApi: IRunApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.buildApi = buildApi;
        this.runApi = runApi;

    }

    public async getStageStatus(build: Build, name: string): Promise<IBuildStage> {

        const debug = this.debugLogger.extend(this.getStageStatus.name);

        const buildTimeline: Timeline = await this.buildApi.getBuildTimeline(build.project!.name!, build.id!, build.orchestrationPlan!.planId);

        if (!buildTimeline) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build timeline`);

        }

        const stageTimeline: TimelineRecord | undefined = buildTimeline.records!.find(
            (record: TimelineRecord) => record.name === name && record.type === "Stage");

        if (!stageTimeline) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build stage <${name}> timeline`);

        }

        const buildStages: unknown[] = await this.runApi.getRunStages(build);

        if (!buildStages.length) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build stages`);

        }

        const buildStage: any = buildStages.find(
            (stage: any) => stage.name === name);

        if (!buildStage) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build stage <${name}> status`);

        }

        const stageStatus: IBuildStage = this.newBuildStage(stageTimeline, buildStage);

        const stagePhases: TimelineRecord[] = this.filterTimelineRecords(buildTimeline, stageTimeline.id!, "Phase");

        for (const phase of stagePhases) {

            const phaseJobs: TimelineRecord[] = this.filterTimelineRecords(buildTimeline, phase.id!, "Job");

            for (const job of phaseJobs) {

                const jobStatus: IBuildJob = this.newBuildJob(job);

                const jobTasks: TimelineRecord[] = this.filterTimelineRecords(buildTimeline, job.id!, "Task");

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

    private newBuildStage(timelineRecord: TimelineRecord, stage: any): IBuildStage {

        const buildStage: IBuildStage = {

            id: timelineRecord.id!,
            name: timelineRecord.name!,
            startTime: timelineRecord.startTime!,
            finishTime: timelineRecord.finishTime!,
            attempt: timelineRecord.attempt!,
            state: timelineRecord.state!,
            result: timelineRecord.result!,
            checks: stage.stateData!.pendingChecks ? true : false,
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
