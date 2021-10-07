import { IEndpoint } from "./iendpoint";
import { IParameters } from "./iparameters";
import { IDetails } from "./idetails";
import { RunStatus } from "../../workers/orchestrator/runstatus";

export interface ITaskHelper {

    getEndpoint(): Promise<IEndpoint>;
    getParameters(): Promise<IParameters>;
    getDetails(): Promise<IDetails>;
    validate(status: RunStatus): Promise<void>;
    fail(message: string): Promise<void>;

}
