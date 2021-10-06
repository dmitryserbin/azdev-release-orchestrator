import { IOrchestratorFactory } from "../interfaces/factories/iorchestratorfactory";
import { IApiFactory } from "../interfaces/factories/iapifactory";
import { ILogger } from "../interfaces/loggers/ilogger";
import { IDeployer } from "../interfaces/orchestrator/ideployer";
import { Deployer } from "../orchestrator/deployer";
import { ICreator } from "../interfaces/orchestrator/icreator";
import { Creator } from "../orchestrator/creator";
import { IReporter } from "../interfaces/orchestrator/ireporter";
import { Reporter } from "../orchestrator/reporter";
import { ICoreHelper } from "../interfaces/helpers/icorehelper";
import { CoreHelper } from "../helpers/corehelper";
import { ICoreApiRetry } from "../interfaces/extensions/icoreapiretry";
import { IBuildApiRetry } from "../interfaces/extensions/ibuildapiretry";
import { IBuildHelper } from "../interfaces/helpers/ibuildhelper";
import { BuildHelper } from "../helpers/buildhelper";
import { IDebug } from "../interfaces/loggers/idebug";

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
