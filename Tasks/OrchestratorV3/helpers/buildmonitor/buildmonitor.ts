/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, Timeline, TimelineRecord } from "azure-devops-node-api/interfaces/BuildInterfaces";

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

        const buildTimeline: Timeline = await this.buildApi.getBuildTimeline(build.project!.name!, build.id!, build.orchestrationPlan!.planId);

        if (!buildTimeline) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build timeline`);

        }

        const stageRecord: TimelineRecord | undefined = buildTimeline.records!.find(
            (record: TimelineRecord) => record.name === name && record.type === "Stage");

        if (!stageRecord) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build stage <${name}> record`);

        }

        const stageStatus: IBuildStage = {

            id: stageRecord.id!,
            name: stageRecord.name!,
            startTime: stageRecord.startTime!,
            finishTime: stageRecord.finishTime!,
            attempt: stageRecord.attempt!,
            state: stageRecord.state!,
            result: stageRecord.result!,
            jobs: [],

        };

        const phases: TimelineRecord[] = buildTimeline.records!.filter(
            (record: TimelineRecord) => record.parentId === stageStatus.id && record.type === "Phase").sort(
                (left, right) => left.order! - right.order!);

        for (const phase of phases) {

            const jobs: TimelineRecord[] = buildTimeline.records!.filter(
                (record: TimelineRecord) => record.parentId === phase.id && record.type === "Job").sort(
                    (left, right) => left.order! - right.order!);

            for (const job of jobs) {

                const jobStatus: IBuildJob = {

                    id: job.id!,
                    name: job.name!,
                    workerName: job.workerName!,
                    startTime: job.startTime!,
                    finishTime: job.finishTime!,
                    state: job.state!,
                    result: job.result!,
                    tasks: [],

                };

                const tasks: TimelineRecord[] = buildTimeline.records!.filter(
                    (record: TimelineRecord) => record.parentId === job.id && record.type === "Task").sort(
                        (left, right) => left.order! - right.order!);

                for (const task of tasks) {

                    const taskStatus: IBuildTask = {

                        id: task.id!,
                        name: task.name!,
                        startTime: task.startTime!,
                        finishTime: task.finishTime!,
                        state: task.state!,
                        result: task.result!,

                    };

                    jobStatus.tasks.push(taskStatus);

                }

                stageStatus.jobs.push(jobStatus);

            }

        }

        debug(stageStatus);

        return stageStatus;

    }

}
