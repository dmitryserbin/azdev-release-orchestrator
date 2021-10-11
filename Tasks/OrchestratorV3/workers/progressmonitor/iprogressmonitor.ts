import { IRunProgress } from "../../orchestrator/irunprogress";
import { IRun } from "../runcreator/irun";

export interface IProgressMonitor {

    createProgress(run: IRun): IRunProgress

}
