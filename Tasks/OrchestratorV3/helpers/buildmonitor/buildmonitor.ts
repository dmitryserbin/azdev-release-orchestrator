/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";
import { IBuildMonitor } from "./ibuildmonitor";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";

export class BuildMonitor implements IBuildMonitor {

    private debugLogger: IDebug;

    private runApi: IRunApiRetry;

    constructor(runApi: IRunApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.runApi = runApi;

    }

    public async getStageStatus(build: Build, name: string): Promise<IBuildStage> {

        const debug = this.debugLogger.extend(this.getStageStatus.name);

        const runDetails: any = await this.runApi.getRunDetails(build);

        const stageStatus: IBuildStage = runDetails.stages.find(
            (stage: IBuildStage) => stage.name === name);

        debug(stageStatus);

        return stageStatus;

    }

}
