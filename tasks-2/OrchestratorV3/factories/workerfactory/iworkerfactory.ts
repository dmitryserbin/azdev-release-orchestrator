import { IRunDeployer } from "../../workers/rundeployer/irundeployer"
import { IRunCreator } from "../../workers/runcreator/iruncreator"
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter"

export interface IWorkerFactory {
	createRunCreator(): Promise<IRunCreator>
	createRunDeployer(): Promise<IRunDeployer>
	createProgressReporter(): Promise<IProgressReporter>
}
