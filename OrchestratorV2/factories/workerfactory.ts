import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { IBuildApi } from "azure-devops-node-api/BuildApi";

import { IWorkerFactory } from "../interfaces/factories/workerfactory";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDeployer } from "../interfaces/workers/deployer";
import { Deployer } from "../workers/deployer";
import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { CoreHelper } from "../helpers/corehelper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { ReleaseHelper } from "../helpers/releasehelper";

export class WorkerFactory implements IWorkerFactory {

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

        const coreHelper: ICoreHelper = new CoreHelper(coreApi, this.debugLogger);
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugLogger);

        return new Deployer(coreHelper, releaseHelper, this.debugLogger, this.consoleLogger);

    }

}
