import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IDetails } from "../../helpers/taskhelper/idetails";
import { IRunProgress } from "./irunprogress";

export interface IOrchestrator {

    orchestrate(parameters: IParameters, details: IDetails): Promise<IRunProgress>;

}
