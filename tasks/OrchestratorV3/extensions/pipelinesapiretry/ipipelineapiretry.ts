import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"

export interface IPipelinesApiRetry {
	queueRun(definition: BuildDefinition, request: unknown): Promise<unknown>
	updateApproval(build: Build, request: unknown): Promise<unknown>
}
