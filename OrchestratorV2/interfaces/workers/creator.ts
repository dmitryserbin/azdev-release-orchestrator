import { IParameters } from "../task/parameters";
import { IDetails } from "../task/details";
import { IReleaseJob } from "../orchestrator/releasejob";

export interface ICreator {

    createJob(parameters: IParameters, details: IDetails): Promise<IReleaseJob>;
}
