import { ReleaseDefinition, Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { IReleaseFilter } from "../orchestrator/releasefilter";

export interface IReleaseHelper {

    getDefinition(projectName: string, definitionId: number): Promise<ReleaseDefinition>;
    getRelease(projectName: string, releaseId: number, stages: string[]): Promise<Release>;
    findRelease(projectName: string, definitionId: number, stages: string[], filter: IReleaseFilter): Promise<Release>;
    getStages(release: Release, stages: string[]): Promise<string[]>;

}
