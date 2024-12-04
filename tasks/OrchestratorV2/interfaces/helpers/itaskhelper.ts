import { IEndpoint } from "../task/iendpoint"
import { IParameters } from "../task/iparameters"
import { IDetails } from "../task/idetails"
import { ReleaseStatus } from "../common/ireleasestatus"

export interface ITaskHelper {
	getEndpoint(): Promise<IEndpoint>
	getParameters(): Promise<IParameters>
	getDetails(): Promise<IDetails>
	validate(status: ReleaseStatus): Promise<void>
	fail(message: string): Promise<void>
}
