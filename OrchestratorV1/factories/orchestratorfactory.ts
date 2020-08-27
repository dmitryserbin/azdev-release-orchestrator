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
import { IApprover } from "../interfaces/orchestrator/approver";
import { Approver } from "../orchestrator/approver";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { Reporter } from "../orchestrator/reporter";
import { ICoreApiRetry } from "../interfaces/extensions/coreapiretry";
import { IBuildApiRetry } from "../interfaces/extensions/buildapiretry";
import { IReleaseApiRetry } from "../interfaces/extensions/releaseapiretry";

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

        const coreApi: ICoreApiRetry = await this.apiFactory.createCoreApi();
        const buildApi: IBuildApiRetry = await this.apiFactory.createBuildApi();
        const releaseApi: IReleaseApiRetry = await this.apiFactory.createReleaseApi();

        const coreHelper: ICoreHelper = new CoreHelper(coreApi, this.debugCreator);
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.debugCreator);
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugCreator);
        const progressReporter: IReporter = new Reporter(this.debugCreator);

        return new Creator(coreHelper, buildHelper, releaseHelper, progressReporter, this.debugCreator, this.consoleLogger);

    }

    public async createDeployer(): Promise<IDeployer> {

        const releaseApi: IReleaseApiRetry = await this.apiFactory.createReleaseApi();

        const commonHelper: ICommonHelper = new CommonHelper(this.debugCreator);
        const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugCreator);
        const releaseApprover: IApprover = new Approver(commonHelper, releaseHelper, this.debugCreator, this.consoleLogger);
        const progressMonitor: IMonitor = new Monitor(this.debugCreator);
        const progressReporter: IReporter = new Reporter(this.debugCreator);

        return new Deployer(commonHelper, releaseHelper, releaseApprover, progressMonitor, progressReporter, this.debugCreator, this.consoleLogger);

    }

    public async createReporter(): Promise<IReporter> {

        return new Reporter(this.debugCreator);

    }

}
