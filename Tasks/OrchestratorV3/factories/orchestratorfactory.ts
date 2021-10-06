import { IOrchestratorFactory } from "../interfaces/factories/orchestratorfactory";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { ILogger } from "../interfaces/loggers/logger";
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
import { IDebug } from "../interfaces/loggers/debug";

export class OrchestratorFactory implements IOrchestratorFactory {

    private logger: ILogger;

    private apiFactory: IApiFactory;

    constructor(apiFactory: IApiFactory, logger: ILogger) {

        this.logger = logger;

        this.apiFactory = apiFactory;

    }

    public async createCreator(): Promise<ICreator> {

        const coreApi: ICoreApiRetry = await this.apiFactory.createCoreApi();
        const coreHelper: ICoreHelper = new CoreHelper(coreApi, this.logger);

        const buildApi: IBuildApiRetry = await this.apiFactory.createBuildApi();
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.logger);

        const reporter: IReporter = new Reporter(this.logger);

        return new Creator(coreHelper, buildHelper, reporter, this.logger);

    }

    public async createDeployer(): Promise<IDeployer> {

        return new Deployer(this.logger);

    }

    public async createReporter(): Promise<IReporter> {

        return new Reporter(this.logger);

    }

}
