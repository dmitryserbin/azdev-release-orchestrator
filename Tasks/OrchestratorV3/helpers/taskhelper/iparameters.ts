import { IFilters } from "./ifilters";
import { ReleaseType } from "./releasetype";
import { ISettings } from "./isettings";
import { IBuildParameters } from "./ibuildparameters";
import { IDetails } from "./idetails";

export interface IParameters {

    releaseType: ReleaseType;
    projectName: string;
    definitionName: string;
    buildNumber: string;
    stages: string[];
    parameters: IBuildParameters;
    filters: IFilters;
    settings: ISettings;
    details: IDetails;

}
