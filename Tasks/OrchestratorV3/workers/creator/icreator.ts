import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IDetails } from "../../helpers/taskhelper/idetails";
import { IJob } from "./ijob";

export interface ICreator {

    createJob(parameters: IParameters, details: IDetails): Promise<IJob>;

}
