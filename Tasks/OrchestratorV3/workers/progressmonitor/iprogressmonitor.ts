/* eslint-disable @typescript-eslint/no-explicit-any */

import { IRunProgress } from "../../orchestrator/irunprogress";
import { IStageProgress } from "../../orchestrator/istageprogress";
import { IRun } from "../runcreator/irun";
import { IBuildStage } from "./ibuildstage";

export interface IProgressMonitor {

    createRunProgress(run: IRun): IRunProgress;
    updateRunProgress(runProgress: IRunProgress): IRunProgress;
    updateStageProgress(stageProgress: IStageProgress, stageStatus: IBuildStage): IStageProgress;
    getActiveStages(runProgress: IRunProgress): IStageProgress[];

}
