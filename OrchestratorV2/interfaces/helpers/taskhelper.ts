import { IEndpoint } from "../task/endpoint";
import { IParameters } from "../task/parameters";
import { IDetails } from "../task/details";

export interface ITaskHelper {

    getEndpoint(): Promise<IEndpoint>;
    getParameters(): Promise<IParameters>;
    getDetails(): Promise<IDetails>;

}
