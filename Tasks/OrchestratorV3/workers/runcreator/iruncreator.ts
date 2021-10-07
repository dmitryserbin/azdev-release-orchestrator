import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IRun } from "./irun";

export interface IRunCreator {

    create(parameters: IParameters): Promise<IRun>;

}
