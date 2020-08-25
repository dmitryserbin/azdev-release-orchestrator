import { IFilters } from "./filters";
import { IReleaseVariable } from "../common/releasevariable";
import { ReleaseType } from "../common/releasetype";

export interface IParameters {

    releaseType: ReleaseType;
    projectId: string;
    definitionId: string;
    releaseId: string;
    stages: string[];
    variables: IReleaseVariable[];
    filters: IFilters;

}
