import { EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IStageStatusFilter {

    stages: string[];
    statuses: EnvironmentStatus[],

}
