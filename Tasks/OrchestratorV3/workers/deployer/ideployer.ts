import { IDetails } from "../../helpers/taskhelper/idetails";
import { IJob } from "../creator/ijob";
import { IReleaseProgress } from "../orchestrator/ireleaseprogress";

export interface IDeployer {

    deployManual(job: IJob, details: IDetails): Promise<IReleaseProgress>;
    deployAutomated(job: IJob, details: IDetails): Promise<IReleaseProgress>;

}
