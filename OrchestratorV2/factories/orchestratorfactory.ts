import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";

import { IOrchestratorFactory } from "../interfaces/factories/orchestratorfactory";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { IDeployer } from "../interfaces/orchestrator/deployer";
import { Deployer } from "../orchestrator/deployer";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { CoreHelper } from "../helpers/corehelper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { ReleaseHelper } from "../helpers/releasehelper";
import { ICreator } from "../interfaces/orchestrator/creator";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { BuildHelper } from "../helpers/buildhelper";
import { Creator } from "../orchestrator/creator";
import { IMonitor } from "../interfaces/orchestrator/monitor";
import { Monitor } from "../orchestrator/monitor";
import { ICommonHelper } from "../interfaces/helpers/commonhelper";
import { CommonHelper } from "../helpers/commonhelper";

export class OrchestratorFactory implements IOrchestratorFactory {

    private debugCreator: IDebugCreator;
    private consoleLogger: IConsoleLogger;

    private apiFactory: IApiFactory;

    constructor(apiFactory: IApiFactory, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugCreator = debugCreator;
        this.consoleLogger = consoleLogger;

        this.apiFactory = apiFactory;

    }

    public async createCreator(): Promise<ICreator> {

        const coreApi: ICoreApi = await this.apiFactory.createCoreApi();
        const buildApi: IBuildApi = await this.apiFactory.createBuildApi();
        const releaseApi: IReleaseApi = await this.apiFactory.createReleaseApi();

        const coreHelper: ICoreHelper = new CoreHelper(coreApi, this.debugCreator);
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.debugCreator);
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugCreator);

        return new Creator(coreHelper, buildHelper, releaseHelper, this.debugCreator, this.consoleLogger);

    }

    public async createDeployer(): Promise<IDeployer> {

        const releaseApi: IReleaseApi = await this.apiFactory.createReleaseApi();

        const commonHelper: ICommonHelper = new CommonHelper(this.debugCreator);
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugCreator);
        const progressMonitor: IMonitor = new Monitor(this.debugCreator);

        return new Deployer(commonHelper, releaseHelper, progressMonitor, this.debugCreator, this.consoleLogger);

    }

}
