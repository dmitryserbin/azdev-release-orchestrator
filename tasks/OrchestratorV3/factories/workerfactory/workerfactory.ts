import { IWorkerFactory } from "./iworkerfactory"
import { IApiFactory } from "../apifactory/iapifactory"
import { ILogger } from "../../loggers/ilogger"
import { IRunDeployer } from "../../workers/rundeployer/irundeployer"
import { RunDeployer } from "../../workers/rundeployer/rundeployer"
import { IRunCreator } from "../../workers/runcreator/iruncreator"
import { RunCreator } from "../../workers/runcreator/runcreator"
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter"
import { ProgressReporter } from "../../workers/progressreporter/progressreporter"
import { ICoreApiRetry } from "../../extensions/coreapiretry/icoreapiretry"
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry"
import { IFilterCreator } from "../../workers/filtercreator/ifiltercreator"
import { FilterCreator } from "../../workers/filtercreator/filtercreator"
import { IProjectSelector } from "../../helpers/projectselector/iprojectselector"
import { ProjectSelector } from "../../helpers/projectselector/projectselector"
import { IDefinitionSelector } from "../../helpers/definitionselector/idefinitionselector"
import { DefinitionSelector } from "../../helpers/definitionselector/definitionselector"
import { IBuildSelector } from "../../helpers/buildselector/ibuildselector"
import { BuildSelector } from "../../helpers/buildselector/buildselector"
import { IBuildWebApiRetry } from "../../extensions/buildwebapiretry/ibuildwebapiretry"
import { IProgressMonitor } from "../../workers/progressmonitor/iprogressmonitor"
import { ProgressMonitor } from "../../workers/progressmonitor/progressmonitor"
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper"
import { CommonHelper } from "../../helpers/commonhelper/commonhelper"
import { IStageSelector } from "../../helpers/stageselector/istageselector"
import { StageSelector } from "../../helpers/stageselector/stageselector"
import { IStageApprover } from "../../workers/stageapprover/istageapprover"
import { StageApprover } from "../../workers/stageapprover/stageapprover"
import { IPipelinesApiRetry } from "../../extensions/pipelinesapiretry/ipipelineapiretry"
import { IStageDeployer } from "../../workers/stagedeployer/istagedeployer"
import { StageDeployer } from "../../workers/stagedeployer/stagedeployer"

export class WorkerFactory implements IWorkerFactory {
	private logger: ILogger

	private apiFactory: IApiFactory

	constructor(apiFactory: IApiFactory, logger: ILogger) {
		this.logger = logger

		this.apiFactory = apiFactory
	}

	public async createRunCreator(): Promise<IRunCreator> {
		const coreApi: ICoreApiRetry = await this.apiFactory.createCoreApi()
		const projectSelector: IProjectSelector = new ProjectSelector(coreApi, this.logger)

		const buildApi: IBuildApiRetry = await this.apiFactory.createBuildApi()
		const definitionSelector: IDefinitionSelector = new DefinitionSelector(buildApi, this.logger)

		const pipelinesApi: IPipelinesApiRetry = await this.apiFactory.createPipelinesApi()
		const buildWebApi: IBuildWebApiRetry = await this.apiFactory.createBuildWebApi()
		const buildSelector: IBuildSelector = new BuildSelector(buildApi, pipelinesApi, buildWebApi, this.logger)

		const filterCreator: IFilterCreator = new FilterCreator(this.logger)
		const progressReporter: IProgressReporter = new ProgressReporter(this.logger)

		return new RunCreator(projectSelector, definitionSelector, buildSelector, filterCreator, progressReporter, this.logger)
	}

	public async createRunDeployer(): Promise<IRunDeployer> {
		const commonHelper: ICommonHelper = new CommonHelper(this.logger)

		const buildApi: IBuildApiRetry = await this.apiFactory.createBuildApi()
		const pipelinesApi: IPipelinesApiRetry = await this.apiFactory.createPipelinesApi()
		const buildWebApi: IBuildWebApiRetry = await this.apiFactory.createBuildWebApi()

		const buildSelector: IBuildSelector = new BuildSelector(buildApi, pipelinesApi, buildWebApi, this.logger)
		const stageSelector: IStageSelector = new StageSelector(buildApi, pipelinesApi, commonHelper, this.logger)
		const stageApprover: IStageApprover = new StageApprover(buildSelector, stageSelector, commonHelper, this.logger)

		const progressMonitor: IProgressMonitor = new ProgressMonitor(this.logger)
		const progressReporter: IProgressReporter = new ProgressReporter(this.logger)

		const stageDeployer: IStageDeployer = new StageDeployer(commonHelper, stageSelector, stageApprover, progressReporter, this.logger)

		return new RunDeployer(commonHelper, stageDeployer, progressMonitor, progressReporter, this.logger)
	}

	public async createProgressReporter(): Promise<IProgressReporter> {
		return new ProgressReporter(this.logger)
	}
}
