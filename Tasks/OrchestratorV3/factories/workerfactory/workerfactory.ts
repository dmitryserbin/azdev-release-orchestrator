import { IWorkerFactory } from "./iworkerfactory";
import { IApiFactory } from "../apifactory/iapifactory";
import { ILogger } from "../../loggers/ilogger";
import { IRunDeployer } from "../../workers/rundeployer/irundeployer";
import { RunDeployer } from "../../workers/rundeployer/rundeployer";
import { IRunCreator } from "../../workers/runcreator/iruncreator";
import { RunCreator } from "../../workers/runcreator/runcreator";
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter";
import { ProgressReporter } from "../../workers/progressreporter/progressreporter";
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

    public async createRunCreator(): Promise<IRunCreator> {

        const coreApi: ICoreApiRetry = await this.apiFactory.createCoreApi();
        const coreHelper: ICoreHelper = new CoreHelper(coreApi, this.logger);

        const buildApi: IBuildApiRetry = await this.apiFactory.createBuildApi();
        const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.logger);

        const filtrator: IFiltrator = new Filtrator(this.logger);
        const progressReporter: IProgressReporter = new ProgressReporter(this.logger);

        return new RunCreator(coreHelper, buildHelper, filtrator, progressReporter, this.logger);

    }

    public async createRunDeployer(): Promise<IRunDeployer> {

        return new RunDeployer(this.logger);

    }

    public async createProgressReporter(): Promise<IProgressReporter> {

        return new ProgressReporter(this.logger);

    }

}
