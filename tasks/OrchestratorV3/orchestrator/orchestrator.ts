import { IOrchestrator } from "./iorchestrator"
import { IRunDeployer } from "../workers/rundeployer/irundeployer"
import { IParameters } from "../helpers/taskhelper/iparameters"
import { Strategy } from "../helpers/taskhelper/strategy"
import { IDebug } from "../loggers/idebug"
import { ILogger } from "../loggers/ilogger"
import { IRun } from "../workers/runcreator/irun"
import { IRunCreator } from "../workers/runcreator/iruncreator"
import { IRunProgress } from "./irunprogress"
import { IProgressReporter } from "../workers/progressreporter/iprogressreporter"

export class Orchestrator implements IOrchestrator {
	private logger: ILogger
	private debugLogger: IDebug

	private runCreator: IRunCreator
	private runDeployer: IRunDeployer
	private progressReporter: IProgressReporter

	constructor(runCreator: IRunCreator, runDeployer: IRunDeployer, progressReporter: IProgressReporter, logger: ILogger) {
		this.logger = logger
		this.debugLogger = logger.extend(this.constructor.name)

		this.runCreator = runCreator
		this.runDeployer = runDeployer
		this.progressReporter = progressReporter
	}

	public async orchestrate(parameters: IParameters): Promise<IRunProgress> {
		const debug = this.debugLogger.extend(this.orchestrate.name)

		let runProgress: IRunProgress

		const run: IRun = await this.runCreator.create(parameters)

		debug(`Starting <${Strategy[parameters.strategy]}> pipeline orchestration strategy`)

		switch (parameters.strategy) {
			case Strategy.New: {
				this.logger.log(`Executing new <${run.definition.name}> pipeline <${run.build.buildNumber}> (${run.build.id}) run`)

				this.progressReporter.logRun(run)

				runProgress = await this.runDeployer.deployAutomated(run)

				break
			}
			case Strategy.Latest: {
				this.logger.log(`Executing latest <${run.definition.name}> pipeline <${run.build.buildNumber}> (${run.build.id}) run`)

				this.progressReporter.logRun(run)

				runProgress = await this.runDeployer.deployManual(run)

				break
			}
			case Strategy.Specific: {
				this.logger.log(`Executing specific <${run.definition.name}> pipeline <${run.build.buildNumber}> (${run.build.id}) run`)

				this.progressReporter.logRun(run)

				runProgress = await this.runDeployer.deployManual(run)

				break
			}
		}

		this.progressReporter.logRunProgress(runProgress)

		return runProgress
	}
}
