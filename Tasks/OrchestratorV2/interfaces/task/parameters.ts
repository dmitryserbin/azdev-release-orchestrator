import { IFilters } from "./filters";
import { IReleaseVariable } from "../common/releasevariable";
import { ReleaseType } from "../common/releasetype";
import { ISettings } from "../common/settings";

export interface IParameters {

    releaseType: ReleaseType;
    projectName: string;
    definitionName: string;
    releaseName: string;
    stages: string[];
    variables: IReleaseVariable[];
    filters: IFilters;
    settings: ISettings;

}
