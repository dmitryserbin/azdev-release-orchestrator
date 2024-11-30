import { IDeployer } from "../orchestrator/ideployer"
import { ICreator } from "../orchestrator/icreator"
import { IReporter } from "../orchestrator/ireporter"

export interface IOrchestratorFactory {
	createCreator(): Promise<ICreator>
	createDeployer(): Promise<IDeployer>
	createReporter(): Promise<IReporter>
}
