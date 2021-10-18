import { IRunProgress } from "../../orchestrator/irunprogress";
import { IRun } from "../runcreator/irun";
import { IBuildStage } from "./ibuildstage";

export interface IProgressMonitor {

    createRunProgress(run: IRun): IRunProgress;
    updateRunProgress(runProgress: IRunProgress): IRunProgress;
    getActiveStages(runProgress: IRunProgress): IBuildStage[];
    getPendingStages(runProgress: IRunProgress): IBuildStage[];

}
