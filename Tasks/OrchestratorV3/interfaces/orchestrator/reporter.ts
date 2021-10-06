import { IBuildParameters } from "../common/buildparameters";
import { IFilters } from "../task/filters";

export interface IReporter {

    getParameters(parameters: IBuildParameters): string;

}
