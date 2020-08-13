import { ReleaseDefinition, Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

export interface IReleaseHelper {

    getDefinition(projectName: string, definitionId: number): Promise<ReleaseDefinition>;
    getRelease(project: TeamProject, releaseId: number, stages: string[]): Promise<Release>;
    getStages(release: Release, stages: string[]): Promise<string[]>;

}
