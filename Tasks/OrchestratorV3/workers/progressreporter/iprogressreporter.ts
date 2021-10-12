import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { IFilters } from "../../helpers/taskhelper/ifilters";
import { ReleaseType } from "../../helpers/taskhelper/releasetype";
import { IStageProgress } from "../../orchestrator/istageprogress";
import { IRun } from "../runcreator/irun";

export interface IProgressReporter {

    logRun(run: IRun): void;
    logParameters(parameters: IBuildParameters): void;
    logFilters(filters: IFilters, type: ReleaseType): void;
    logStageProgress(stageProgress: IStageProgress): void;
    logStagesProgress(stagesProgress: IStageProgress[]): void;

}
