import { IDetails } from "../../helpers/taskhelper/idetails";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../orchestrator/irunprogress";

export interface IDeployer {

    deployManual(job: IRun, details: IDetails): Promise<IRunProgress>;
    deployAutomated(job: IRun, details: IDetails): Promise<IRunProgress>;

}
