import { IDetails } from "../task/details";
import { IReleaseJob } from "./releasejob";
import { IReleaseProgress } from "./releaseprogress";

export interface IDeployer {

    deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress>;
    deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress>;

}
