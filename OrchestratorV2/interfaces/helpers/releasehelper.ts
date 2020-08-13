import { ReleaseDefinition, Release, ArtifactMetadata } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseFilter } from "../orchestrator/releasefilter";
import { IArtifactFilter } from "../orchestrator/artifactfilter";
import { IDetails } from "../task/details";

export interface IReleaseHelper {

    getDefinition(projectName: string, definitionId: number): Promise<ReleaseDefinition>;
    getRelease(projectName: string, releaseId: number, stages: string[]): Promise<Release>;
    findRelease(projectName: string, definitionId: number, stages: string[], filter: IReleaseFilter): Promise<Release>;
    createRelease(projectName: string, definition: ReleaseDefinition, details: IDetails, stages?: string[], artifacts?: IArtifactFilter[]): Promise<Release>;
    getArtifacts(projectName: string, definitionId: number, primaryId: string, versionId?: string, sourceBranch?: string): Promise<ArtifactMetadata[]>;
    getDefinitionStages(definition: ReleaseDefinition, stages: string[]): Promise<string[]>;
    getReleaseStages(release: Release, stages: string[]): Promise<string[]>;

}
