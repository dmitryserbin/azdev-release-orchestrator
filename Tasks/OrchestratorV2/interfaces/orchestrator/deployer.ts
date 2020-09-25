import { IDetails } from "../task/details";
import { IReleaseJob } from "../common/releasejob";
import { IReleaseProgress } from "../common/releaseprogress";

export interface IDeployer {

    deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress>;
    deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress>;

}
