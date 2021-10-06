import { IFilters } from "./filters";
import { ReleaseType } from "../common/releasetype";
import { ISettings } from "../common/settings";
import { IBuildParameters } from "../common/buildparameters";

export interface IParameters {

    releaseType: ReleaseType;
    projectName: string;
    definitionName: string;
    releaseName: string;
    stages: string[];
    parameters: IBuildParameters;
    filters: IFilters;
    settings: ISettings;

}
