import { IEndpoint } from "../task/endpoint";
import { IParameters } from "../task/parameters";
import { IDetails } from "../task/details";
import { ReleaseStatus } from "../common/releasestatus";

export interface ITaskHelper {

    getEndpoint(): Promise<IEndpoint>;
    getParameters(): Promise<IParameters>;
    getDetails(): Promise<IDetails>;
    validate(status: ReleaseStatus): Promise<void>;
    fail(message: string): Promise<void>;

}
