import { IParameters } from "../task/iparameters";
import { IDetails } from "../task/idetails";
import { IReleaseJob } from "../common/ireleasejob";

export interface ICreator {

    createJob(parameters: IParameters, details: IDetails): Promise<IReleaseJob>;

}
