import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";

export interface IReporter {

    getParameters(parameters: IBuildParameters): string;

}
