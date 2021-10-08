import { IDetails } from "../../helpers/taskhelper/idetails";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";

export interface IRunDeployer {

    deployManual(job: IRun, details: IDetails): Promise<IRunProgress>;
    deployAutomated(job: IRun, details: IDetails): Promise<IRunProgress>;

}
