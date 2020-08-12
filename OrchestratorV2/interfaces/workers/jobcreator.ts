import { IParameters } from "../task/parameters";
import { IDetails } from "../task/details";
import { IReleaseJob } from "../orchestrator/releasejob";

export interface IJobCreator {

    createJob(parameters: IParameters, details: IDetails): Promise<IReleaseJob>;
}
