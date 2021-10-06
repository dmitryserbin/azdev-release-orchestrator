import { IDetails } from "../task/idetails";
import { IReleaseJob } from "../common/ireleasejob";
import { IReleaseProgress } from "../common/ireleaseprogress";

export interface IDeployer {

    deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress>;
    deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress>;

}
