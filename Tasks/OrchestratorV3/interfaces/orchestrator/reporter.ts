import { IBuildParameters } from "../common/buildparameters";

export interface IReporter {

    getParameters(parameters: IBuildParameters): string;

}
