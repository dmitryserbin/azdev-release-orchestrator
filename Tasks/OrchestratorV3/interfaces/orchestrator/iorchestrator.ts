import { IParameters } from "../task/iparameters";
import { IDetails } from "../task/idetails";
import { IReleaseProgress } from "../common/ireleaseprogress";

export interface IOrchestrator {

    orchestrate(parameters: IParameters, details: IDetails): Promise<IReleaseProgress>;

}
