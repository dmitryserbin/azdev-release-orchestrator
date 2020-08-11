import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { IBuildApi } from "azure-devops-node-api/BuildApi";

import { IOrchestratorFactory } from "../interfaces/factories/orchestratorfactory";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDeployer } from "../interfaces/deployer/deployer";
import { Deployer } from "../deployer/deployer";
import { ICoreApi } from "azure-devops-node-api/CoreApi";

export class OrchestratorFactory implements IOrchestratorFactory {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    private apiFactory: IApiFactory;

    constructor(apiFactory: IApiFactory, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger;
        this.consoleLogger = consoleLogger;

        this.apiFactory = apiFactory;

    }

    public async createDeployer(): Promise<IDeployer> {

        const coreApi: ICoreApi = await this.apiFactory.createCoreApi();
        const releaseApi: IReleaseApi = await this.apiFactory.createReleaseApi();
        const buildApi: IBuildApi = await this.apiFactory.createBuildApi();

        return new Deployer(coreApi, releaseApi, buildApi, this.debugLogger, this.consoleLogger);

    }

}
