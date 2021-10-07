import { IDetails } from "../task/idetails";
import { IJob } from "../common/ijob";
import { IReleaseProgress } from "../common/ireleaseprogress";

export interface IDeployer {

    deployManual(job: IJob, details: IDetails): Promise<IReleaseProgress>;
    deployAutomated(job: IJob, details: IDetails): Promise<IReleaseProgress>;

}
