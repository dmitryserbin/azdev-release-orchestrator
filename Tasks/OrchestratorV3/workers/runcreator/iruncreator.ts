import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IDetails } from "../../helpers/taskhelper/idetails";
import { IRun } from "./irun";

export interface IRunCreator {

    create(parameters: IParameters, details: IDetails): Promise<IRun>;

}
