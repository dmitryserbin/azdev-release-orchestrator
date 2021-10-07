import { IWorkerFactory } from "./iworkerfactory";
import { IApiFactory } from "../apifactory/iapifactory";
import { ILogger } from "../../loggers/ilogger";
import { IDeployer } from "../../workers/deployer/ideployer";
import { Deployer } from "../../workers/deployer/deployer";
import { ICreator } from "../../workers/creator/icreator";
import { Creator } from "../../workers/creator/creator";
import { IReporter } from "../../workers/reporter/ireporter";
import { Reporter } from "../../workers/reporter/reporter";
import { ICoreHelper } from "../../helpers/corehelper/icorehelper";
import { CoreHelper } from "../../helpers/corehelper/corehelper";
import { ICoreApiRetry } from "../../extensions/coreapiretry/icoreapiretry";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildHelper } from "../../helpers/buildhelper/ibuildhelper";
import { BuildHelper } from "../../helpers/buildhelper/buildhelper";
import { IFiltrator } from "../../workers/filtrator/ifiltrator";
import { Filtrator } from "../../workers/filtrator/filtrator";

export class WorkerFactory implements IWorkerFactory {

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

        const filtrator: IFiltrator = new Filtrator(this.logger);
        const reporter: IReporter = new Reporter(this.logger);

        return new Creator(coreHelper, buildHelper, filtrator, reporter, this.logger);

    }

    public async createDeployer(): Promise<IDeployer> {

        return new Deployer(this.logger);

    }

    public async createReporter(): Promise<IReporter> {

        return new Reporter(this.logger);

    }

}
