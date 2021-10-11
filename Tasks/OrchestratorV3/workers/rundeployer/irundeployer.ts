import { IDetails } from "../../helpers/taskhelper/idetails";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";

export interface IRunDeployer {

    deployManual(run: IRun, details: IDetails): Promise<IRunProgress>;
    deployAutomated(run: IRun, details: IDetails): Promise<IRunProgress>;

}
