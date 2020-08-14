import { IDetails } from "../task/details";
import { IReleaseJob } from "../orchestrator/releasejob";
import { IReleaseProgress } from "../orchestrator/releaseprogress";

export interface IDeployer {

    deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress>;
    deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress>;

}
