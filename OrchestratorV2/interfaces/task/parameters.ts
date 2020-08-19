import { IFilters } from "./filters";

export interface IParameters {

    releaseType: ReleaseType;
    projectId: string;
    definitionId: string;
    releaseId: string;
    stages: string[];
    filters: IFilters;

}

export enum ReleaseType {

    New = "New",
    Specific = "Specific",
    Latest = "Latest",

}
