import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { IFilters } from "../../helpers/taskhelper/ifilters";
import { IRun } from "../runcreator/irun";

export interface IProgressReporter {

    logRun(run: IRun): void;
    logParameters(parameters: IBuildParameters): void;
    logFilters(filters: IFilters): void;

}
