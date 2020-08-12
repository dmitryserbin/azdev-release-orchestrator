import { IDetails } from "../task/details";
import { IReleaseJob } from "../orchestrator/releasejob";

export interface IDeployer {

    deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<void>;
    deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<void>;
}
