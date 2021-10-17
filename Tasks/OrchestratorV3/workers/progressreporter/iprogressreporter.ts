import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { IFilters } from "../../helpers/taskhelper/ifilters";
import { ReleaseType } from "../../helpers/taskhelper/releasetype";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { IBuildStage } from "../progressmonitor/ibuildstage";
import { IRun } from "../runcreator/irun";

export interface IProgressReporter {

    logRun(run: IRun): void;
    logParameters(parameters: IBuildParameters): void;
    logFilters(filters: IFilters, type: ReleaseType): void;
    logStageProgress(stageProgress: IBuildStage): void;
    logStagesProgress(stagesProgress: IBuildStage[]): void;
    logRunProgress(runProgress: IRunProgress): void;

}
