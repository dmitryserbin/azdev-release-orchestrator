import Debug from "debug";

import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";

import { IParameters } from "../interfaces/task/parameters";
import { IDetails } from "../interfaces/task/details";
import { IDeployer } from "../interfaces/deployer/deployer";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";

export class Deployer implements IDeployer {

    private debugLogger: Debug.Debugger;
    private consoleLogger: IConsoleLogger;

    private coreApi: ICoreApi;
    private releaseApi: IReleaseApi;
    private buildApi: IBuildApi;

    constructor(coreApi: ICoreApi, releaseApi: IReleaseApi, buildApi: IBuildApi, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.coreApi = coreApi;
        this.releaseApi = releaseApi;
        this.buildApi = buildApi;

    }

    public async deployManual(parameters: IParameters, releaseDetails: IDetails): Promise<void> {

        // TBU

    }

    public async deployAutomated(parameters: IParameters, releaseDetails: IDetails): Promise<void> {

        // TBU

    }

}
