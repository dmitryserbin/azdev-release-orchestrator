import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { IFilters } from "../../helpers/taskhelper/ifilters";

export interface IProgressReporter {

    logParameters(parameters: IBuildParameters): void;
    logFilters(filters: IFilters): void;

}
