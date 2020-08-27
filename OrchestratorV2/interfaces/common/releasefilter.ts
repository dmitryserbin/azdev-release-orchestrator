import { EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IReleaseFilter {

    artifactVersion: string;
    sourceBranch: string;
    tags: string[];
    stages: string[];
    statuses: EnvironmentStatus[],

}
