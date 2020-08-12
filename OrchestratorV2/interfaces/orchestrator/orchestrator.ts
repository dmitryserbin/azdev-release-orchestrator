import { IParameters } from "../task/parameters";
import { IDetails } from "../task/details";

export interface IOrchestrator {

    run(parameters: IParameters, details: IDetails): Promise<void>;

}
