import { IParameters } from "../task/parameters";
import { IDetails } from "../task/details";

export interface IDeployer {

    deployManual(parameters: IParameters, releaseDetails: IDetails): Promise<void>;
    deployAutomated(parameters: IParameters, releaseDetails: IDetails): Promise<void>;
}
