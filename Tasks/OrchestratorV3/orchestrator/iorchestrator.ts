import { IParameters } from "../helpers/taskhelper/iparameters"
import { IRunProgress } from "./irunprogress"

export interface IOrchestrator {
	orchestrate(parameters: IParameters): Promise<IRunProgress>
}
