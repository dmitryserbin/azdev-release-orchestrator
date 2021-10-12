/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";
import { IBuildMonitor } from "./ibuildmonitor";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob";

export class BuildMonitor implements IBuildMonitor {

    private debugLogger: IDebug;

    private runApi: IRunApiRetry;

    constructor(runApi: IRunApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.runApi = runApi;

    }

    public async getBuildStatus(build: Build): Promise<unknown> {

        const debug = this.debugLogger.extend(this.getBuildStatus.name);

        const buildStatus: any = await this.runApi.getRunDetails(build);

        if (!buildStatus) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build status`);

        }

        debug(`Build <${build.buildNumber}> (${build.id}) status <${buildStatus.status}> retrieved`);

        return buildStatus;

    }

    public async getStageStatus(build: Build, name: string): Promise<IBuildStage> {

        const debug = this.debugLogger.extend(this.getStageStatus.name);

        const buildStatus: any = await this.runApi.getRunDetails(build);

        const stageStatus: IBuildStage = buildStatus.stages.find(
            (stage: IBuildStage) => stage.name === name);

        if (!stageStatus) {

            throw new Error(`Unable to get <${build.buildNumber}> (${build.id}) build stage <${name}> status`);

        }

        const stageJobs: IBuildJob[] = buildStatus.jobs.filter(
            (job: IBuildJob) => job.stageId === stageStatus.id);

        if (stageJobs.length) {

            stageStatus.jobs = stageJobs;

        }

        debug(stageStatus);

        return stageStatus;

    }

}
