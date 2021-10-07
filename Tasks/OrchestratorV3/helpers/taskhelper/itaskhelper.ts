import { IEndpoint } from "./iendpoint";
import { IParameters } from "./iparameters";
import { IDetails } from "./idetails";
import { ReleaseStatus } from "../../workers/orchestrator/releasestatus";

export interface ITaskHelper {

    getEndpoint(): Promise<IEndpoint>;
    getParameters(): Promise<IParameters>;
    getDetails(): Promise<IDetails>;
    validate(status: ReleaseStatus): Promise<void>;
    fail(message: string): Promise<void>;

}
