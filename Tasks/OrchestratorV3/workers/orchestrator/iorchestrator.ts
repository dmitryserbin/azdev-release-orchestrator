import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IDetails } from "../../helpers/taskhelper/idetails";
import { IReleaseProgress } from "./ireleaseprogress";

export interface IOrchestrator {

    orchestrate(parameters: IParameters, details: IDetails): Promise<IReleaseProgress>;

}
