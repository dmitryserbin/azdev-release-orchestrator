import { EnvironmentStatus, ReleaseStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IReleaseFilter {

    artifactVersion: string;
    sourceBranch: string;
    tags: string[];
    stages: string[];
    stageStatuses: EnvironmentStatus[],
    releaseStatus: ReleaseStatus,

}
