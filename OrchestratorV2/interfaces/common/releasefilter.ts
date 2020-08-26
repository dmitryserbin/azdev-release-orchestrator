import { EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IReleaseFilter {

    artifactVersion?: string;
    sourceBranch?: string;
    tag?: string[];
    stageStatus?: EnvironmentStatus[],

}
