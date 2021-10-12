import { IWorkerFactory } from "./iworkerfactory";
import { IApiFactory } from "../apifactory/iapifactory";
import { ILogger } from "../../loggers/ilogger";
import { IRunDeployer } from "../../workers/rundeployer/irundeployer";
import { RunDeployer } from "../../workers/rundeployer/rundeployer";
import { IRunCreator } from "../../workers/runcreator/iruncreator";
import { RunCreator } from "../../workers/runcreator/runcreator";
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter";
import { ProgressReporter } from "../../workers/progressreporter/progressreporter";
import { ICoreApiRetry } from "../../extensions/coreapiretry/icoreapiretry";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IFilterCreator } from "../../workers/filtercreator/ifiltercreator";
import { FilterCreator } from "../../workers/filtercreator/filtercreator";
import { IProjectSelector } from "../../helpers/projectselector/iprojectselector";
import { ProjectSelector } from "../../helpers/projectselector/projectselector";
import { IDefinitionSelector } from "../../helpers/definitionselector/idefinitionselector";
import { DefinitionSelector } from "../../helpers/definitionselector/definitionselector";
import { IBuildSelector } from "../../helpers/buildselector/ibuildselector";
import { BuildSelector } from "../../helpers/buildselector/buildselector";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";
import { IProgressMonitor } from "../../workers/progressmonitor/iprogressmonitor";
import { ProgressMonitor } from "../../workers/progressmonitor/progressmonitor";
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper";
import { CommonHelper } from "../../helpers/commonhelper/commonhelper";
import { IBuildMonitor } from "../../helpers/buildmonitor/ibuildmonitor";
import { BuildMonitor } from "../../helpers/buildmonitor/buildmonitor";

export class WorkerFactory implements IWorkerFactory {

    private logger: ILogger;

    private apiFactory: IApiFactory;

    constructor(apiFactory: IApiFactory, logger: ILogger) {

        this.logger = logger;

        this.apiFactory = apiFactory;

    }

    public async createRunCreator(): Promise<IRunCreator> {

        const coreApi: ICoreApiRetry = await this.apiFactory.createCoreApi();
        const projectSelector: IProjectSelector = new ProjectSelector(coreApi, this.logger);

        const buildApi: IBuildApiRetry = await this.apiFactory.createBuildApi();
        const definitionSelector: IDefinitionSelector = new DefinitionSelector(buildApi, this.logger);

        const runApi: IRunApiRetry = await this.apiFactory.createRunApi();
        const buildSelector: IBuildSelector = new BuildSelector(buildApi, runApi, this.logger);

        const filterCreator: IFilterCreator = new FilterCreator(this.logger);
        const progressReporter: IProgressReporter = new ProgressReporter(this.logger);

        return new RunCreator(projectSelector, definitionSelector, buildSelector, filterCreator, progressReporter, this.logger);

    }

    public async createRunDeployer(): Promise<IRunDeployer> {

        const runApi: IRunApiRetry = await this.apiFactory.createRunApi();
        const buildMonitor: IBuildMonitor = new BuildMonitor(runApi, this.logger);
        const commonHelper: ICommonHelper = new CommonHelper(this.logger);
        const progressMonitor: IProgressMonitor = new ProgressMonitor(this.logger);
        const progressReporter: IProgressReporter = new ProgressReporter(this.logger);

        return new RunDeployer(buildMonitor, commonHelper, progressMonitor, progressReporter, this.logger);

    }

    public async createProgressReporter(): Promise<IProgressReporter> {

        return new ProgressReporter(this.logger);

    }

}
