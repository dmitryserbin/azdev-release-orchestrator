import { IEndpoint } from "./iendpoint"
import { IParameters } from "./iparameters"
import { RunStatus } from "../../orchestrator/runstatus"

export interface ITaskHelper {
	getEndpoint(): Promise<IEndpoint>
	getParameters(): Promise<IParameters>
	validate(status: RunStatus): Promise<void>
	fail(message: string): Promise<void>
}
