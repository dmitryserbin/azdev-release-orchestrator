import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";

export interface IProgressReporter {

    getParameters(parameters: IBuildParameters): string;

}
