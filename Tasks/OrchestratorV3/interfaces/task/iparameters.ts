import { IFilters } from "./ifilters";
import { ReleaseType } from "../common/ireleasetype";
import { ISettings } from "../common/isettings";
import { IBuildParameters } from "../common/ibuildparameters";

export interface IParameters {

    releaseType: ReleaseType;
    projectName: string;
    definitionName: string;
    buildNumber: string;
    stages: string[];
    parameters: IBuildParameters;
    filters: IFilters;
    settings: ISettings;

}
