import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters"
import { IFilters } from "../../helpers/taskhelper/ifilters"
import { Strategy } from "../../helpers/taskhelper/strategy"
import { IRunProgress } from "../../orchestrator/irunprogress"
import { IBuildStage } from "../progressmonitor/ibuildstage"
import { IRun } from "../runcreator/irun"

export interface IProgressReporter {
	logRun(run: IRun): void
	logParameters(parameters: IBuildParameters): void
	logFilters(filters: IFilters, strategy: Strategy): void
	logStageProgress(stageProgress: IBuildStage): void
	logStagesProgress(stagesProgress: IBuildStage[]): void
	logRunProgress(runProgress: IRunProgress): void
}
