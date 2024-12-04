import { IOrchestrator } from "../interfaces/orchestrator/iorchestrator"
import { IDeployer } from "../interfaces/orchestrator/ideployer"
import { IParameters } from "../interfaces/task/iparameters"
import { ReleaseType } from "../interfaces/common/ireleasetype"
import { IDetails } from "../interfaces/task/idetails"
import { IDebugCreator } from "../interfaces/loggers/idebugcreator"
import { IDebugLogger } from "../interfaces/loggers/idebuglogger"
import { IConsoleLogger } from "../interfaces/loggers/iconsolelogger"
import { IOrchestratorFactory } from "../interfaces/factories/iorchestratorfactory"
import { IReleaseJob } from "../interfaces/common/ireleasejob"
import { ICreator } from "../interfaces/orchestrator/icreator"
import { IReleaseProgress } from "../interfaces/common/ireleaseprogress"
import { DeploymentType } from "../interfaces/common/ideploymenttype"
import { IReporter } from "../interfaces/orchestrator/ireporter"

export class Orchestrator implements IOrchestrator {
	private debugLogger: IDebugLogger
	private consoleLogger: IConsoleLogger

	private orchestratorFactory: IOrchestratorFactory

	constructor(orchestratorFactory: IOrchestratorFactory, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {
		this.debugLogger = debugCreator.extend(this.constructor.name)
		this.consoleLogger = consoleLogger
		this.orchestratorFactory = orchestratorFactory
	}

	public async orchestrate(parameters: IParameters, details: IDetails): Promise<IReleaseProgress> {
		const debug = this.debugLogger.extend(this.orchestrate.name)

		let releaseProgress: IReleaseProgress

		const creator: ICreator = await this.orchestratorFactory.createCreator()
		const deployer: IDeployer = await this.orchestratorFactory.createDeployer()
		const reporter: IReporter = await this.orchestratorFactory.createReporter()

		// Create release job
		const releaseJob: IReleaseJob = await creator.createJob(parameters, details)

		switch (parameters.releaseType) {
			case ReleaseType.New: {
				this.consoleLogger.log(`Deploying <${releaseJob.release.name}> (${releaseJob.release.id}) pipeline <${releaseJob.stages?.join("|")}> stage(s) release`)

				this.consoleLogger.log(reporter.getRelease(releaseJob.release, releaseJob.stages))

				switch (releaseJob.type) {
					case DeploymentType.Automated: {
						debug("Release orchestrated automatically as stages deployment conditions are met")

						// Monitor automatically started stages deployment progess
						releaseProgress = await deployer.deployAutomated(releaseJob, details)

						break
					}
					case DeploymentType.Manual: {
						debug("Release orchestrated manually as stages deployment conditions are not met")

						// Manually trigger stages deployment and monitor progress
						releaseProgress = await deployer.deployManual(releaseJob, details)

						break
					}
					default: {
						throw new Error(`Deployment type <${releaseJob.type}> not supported`)
					}
				}

				break
			}
			default: {
				this.consoleLogger.log(
					`Re-deploying <${releaseJob.release.name}> (${releaseJob.release.id}) pipeline <${releaseJob.stages?.join("|")}> stage(s) release`,
				)

				this.consoleLogger.log(reporter.getRelease(releaseJob.release, releaseJob.stages))

				// Manually trigger stages deployment and monitor progress
				releaseProgress = await deployer.deployManual(releaseJob, details)

				break
			}
		}

		this.consoleLogger.log(reporter.getReleaseProgress(releaseProgress))

		return releaseProgress
	}
}
