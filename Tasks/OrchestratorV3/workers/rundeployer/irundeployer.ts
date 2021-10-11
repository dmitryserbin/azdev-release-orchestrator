import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";

export interface IRunDeployer {

    deployManual(run: IRun): Promise<IRunProgress>;
    deployAutomated(run: IRun): Promise<IRunProgress>;

}
