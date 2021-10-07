import { IParameters } from "../task/iparameters";
import { IDetails } from "../task/idetails";
import { IJob } from "../common/ijob";

export interface ICreator {

    createJob(parameters: IParameters, details: IDetails): Promise<IJob>;

}
