import { DeploymentAttempt, EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces"

import { IStageApproval } from "./istageapproval"

export interface IStageProgress {
	name: string
	approval: IStageApproval
	status: EnvironmentStatus
	id?: number
	release?: string
	deployment?: DeploymentAttempt
	duration?: string
}
