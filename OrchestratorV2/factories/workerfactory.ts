import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";

import { IWorkerFactory } from "../interfaces/factories/workerfactory";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDeployer } from "../interfaces/workers/deployer";
import { Deployer } from "../workers/deployer";

import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { CoreHelper } from "../helpers/corehelper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { ReleaseHelper } from "../helpers/releasehelper";
import { ICreator } from "../interfaces/workers/creator";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { BuildHelper } from "../helpers/buildhelper";
import { Creator } from "../workers/creator";
import { IMonitor } from "../interfaces/orchestrator/monitor";
import { Monitor } from "../orchestrator/monitor";
import { ICommonHelper } from "../interfaces/helpers/commonhelper";
import { CommonHelper } from "../helpers/commonhelper";

export class WorkerFactory implements IWorkerFactory {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    private apiFactory: IApiFactory;

    constructor(apiFactory: IApiFactory, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger;
        this.consoleLogger = consoleLogger;

        this.apiFactory = apiFactory;

    }

    public async createCreator(): Promise<ICreator> {

        const coreApi: ICoreApi = await this.apiFactory.createCoreApi();
        const buildApi: IBuildApi = await this.apiFactory.createBuildApi();
        const releaseApi: IReleaseApi = await this.apiFactory.createReleaseApi();

        const commonHelper: ICommonHelper = new CommonHelper(this.debugLogger);
        const coreHelper: ICoreHelper = new CoreHelper(coreApi, this.debugLogger);
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.debugLogger);
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugLogger);

        return new Creator(commonHelper, coreHelper, buildHelper, releaseHelper, this.debugLogger, this.consoleLogger);

    }

    public async createDeployer(): Promise<IDeployer> {

        const releaseApi: IReleaseApi = await this.apiFactory.createReleaseApi();

        const commonHelper: ICommonHelper = new CommonHelper(this.debugLogger);
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugLogger);
        const progressMonitor: IMonitor = new Monitor(this.debugLogger);

        return new Deployer(commonHelper, releaseHelper, progressMonitor, this.debugLogger, this.consoleLogger);

    }

}
