import { EnvironmentStatus, ReleaseStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IReleaseFilter {

    artifactVersionId: number | undefined;
    artifactBranch: string;
    tags: string[];
    stages: string[];
    stageStatuses: EnvironmentStatus[];
    releaseStatus: ReleaseStatus;

}
