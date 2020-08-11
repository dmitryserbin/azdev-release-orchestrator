import { IEndpoint } from "../common/endpoint";
import { IParameters } from "../common/parameters";

export interface ITaskHelper {

    getEndpoint(): Promise<IEndpoint>;
    getParameters(): Promise<IParameters>;

}
