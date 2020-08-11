export interface IParameters {

    releaseType: ReleaseType;
    projectId: string;
    definitionId: string;
    releaseId: string;
    stages: string[];
    releaseTag: string[];
    artifactTag: string[];
    sourceBranch: string;

}

export enum ReleaseType {

    Create = "Create",
    Specific = "Specific",
    Latest = "Latest",

}