import { IOrchestratorFactory } from "../interfaces/factories/iorchestratorfactory"
import { IApiFactory } from "../interfaces/factories/iapifactory"
import { IDebugCreator } from "../interfaces/loggers/idebugcreator"
import { IConsoleLogger } from "../interfaces/loggers/iconsolelogger"
import { IDeployer } from "../interfaces/orchestrator/ideployer"
import { Deployer } from "../orchestrator/deployer"
import { ICoreHelper } from "../interfaces/helpers/icorehelper"
import { CoreHelper } from "../helpers/corehelper"
import { IReleaseHelper } from "../interfaces/helpers/ireleasehelper"
import { ReleaseHelper } from "../helpers/releasehelper"
import { ICreator } from "../interfaces/orchestrator/icreator"
import { IBuildHelper } from "../interfaces/helpers/ibuildhelper"
import { BuildHelper } from "../helpers/buildhelper"
import { Creator } from "../orchestrator/creator"
import { IMonitor } from "../interfaces/orchestrator/imonitor"
import { Monitor } from "../orchestrator/monitor"
import { ICommonHelper } from "../interfaces/helpers/icommonhelper"
import { CommonHelper } from "../helpers/commonhelper"
import { IApprover } from "../interfaces/orchestrator/iapprover"
import { Approver } from "../orchestrator/approver"
import { IReporter } from "../interfaces/orchestrator/ireporter"
import { Reporter } from "../orchestrator/reporter"
import { ICoreApiRetry } from "../interfaces/extensions/icoreapiretry"
import { IBuildApiRetry } from "../interfaces/extensions/ibuildapiretry"
import { IReleaseApiRetry } from "../interfaces/extensions/ireleaseapiretry"
import { IFiltrator } from "../interfaces/orchestrator/ifiltrator"
import { Filtrator } from "../orchestrator/filtrator"

export class OrchestratorFactory implements IOrchestratorFactory {
	private debugCreator: IDebugCreator
	private consoleLogger: IConsoleLogger

	private apiFactory: IApiFactory

	constructor(apiFactory: IApiFactory, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {
		this.debugCreator = debugCreator
		this.consoleLogger = consoleLogger

		this.apiFactory = apiFactory
	}

	public async createCreator(): Promise<ICreator> {
		const coreApi: ICoreApiRetry = await this.apiFactory.createCoreApi()
		const buildApi: IBuildApiRetry = await this.apiFactory.createBuildApi()
		const releaseApi: IReleaseApiRetry = await this.apiFactory.createReleaseApi()

		const coreHelper: ICoreHelper = new CoreHelper(coreApi, this.debugCreator)
		const buildHelper: IBuildHelper = new BuildHelper(buildApi, this.debugCreator)
		const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugCreator)
		const filterCreator: IFiltrator = new Filtrator(buildHelper, releaseHelper, this.debugCreator)
		const progressReporter: IReporter = new Reporter(this.debugCreator)

		return new Creator(coreHelper, releaseHelper, filterCreator, progressReporter, this.debugCreator, this.consoleLogger)
	}

	public async createDeployer(): Promise<IDeployer> {
		const releaseApi: IReleaseApiRetry = await this.apiFactory.createReleaseApi()

		const commonHelper: ICommonHelper = new CommonHelper(this.debugCreator)
		const releaseHelper: IReleaseHelper = new ReleaseHelper(releaseApi, this.debugCreator)
		const releaseApprover: IApprover = new Approver(commonHelper, releaseHelper, this.debugCreator, this.consoleLogger)
		const progressMonitor: IMonitor = new Monitor(this.debugCreator)
		const progressReporter: IReporter = new Reporter(this.debugCreator)

		return new Deployer(commonHelper, releaseHelper, releaseApprover, progressMonitor, progressReporter, this.debugCreator, this.consoleLogger)
	}

	public async createReporter(): Promise<IReporter> {
		return new Reporter(this.debugCreator)
	}
}
