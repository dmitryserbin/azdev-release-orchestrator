import { IOrchestratorFactory } from "../interfaces/factories/orchestratorfactory";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { IDeployer } from "../interfaces/orchestrator/deployer";
import { Deployer } from "../orchestrator/deployer";
import { ICreator } from "../interfaces/orchestrator/creator";
import { Creator } from "../orchestrator/creator";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { Reporter } from "../orchestrator/reporter";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { CoreHelper } from "../helpers/corehelper";
import { ICoreApiRetry } from "../interfaces/extensions/coreapiretry";
import { IBuildApiRetry } from "../interfaces/extensions/buildapiretry";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { BuildHelper } from "../helpers/buildhelper";

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
        const coreHelper: ICoreHelper = new CoreHelper(coreApi, this.debugCreator);

        const buildApi: IBuildApiRetry = await this.apiFactory.createBuildApi();
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.debugCreator);

        return new Creator(coreHelper, buildHelper, this.debugCreator, this.consoleLogger);

    }

    public async createDeployer(): Promise<IDeployer> {

        return new Deployer(this.debugCreator, this.consoleLogger);

    }

    public async createReporter(): Promise<IReporter> {

        return new Reporter(this.debugCreator);

    }

}
