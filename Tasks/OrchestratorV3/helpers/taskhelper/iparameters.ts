import { IFilters } from "./ifilters";
import { Strategy } from "./strategy";
import { ISettings } from "./isettings";
import { IBuildParameters } from "./ibuildparameters";
import { IDetails } from "./idetails";

export interface IParameters {

    strategy: Strategy;
    projectName: string;
    definitionName: string;
    stages: string[];
    parameters: IBuildParameters;
    filters: IFilters;
    settings: ISettings;
    details: IDetails;

}
