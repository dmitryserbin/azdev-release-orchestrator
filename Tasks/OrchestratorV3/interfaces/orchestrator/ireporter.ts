import { IBuildParameters } from "../common/ibuildparameters";

export interface IReporter {

    getParameters(parameters: IBuildParameters): string;

}
