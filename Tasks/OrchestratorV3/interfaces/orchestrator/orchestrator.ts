import { IParameters } from "../task/parameters";
import { IDetails } from "../task/details";
import { IReleaseProgress } from "../common/releaseprogress";

export interface IOrchestrator {

    orchestrate(parameters: IParameters, details: IDetails): Promise<IReleaseProgress>;

}
