import { ReleaseDefinition, Release, ArtifactMetadata, ReleaseEnvironment, ReleaseApproval, ReleaseEnvironmentUpdateMetadata, ApprovalStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseFilter } from "../common/releasefilter";
import { IArtifactFilter } from "../common/artifactfilter";
import { DeploymentType } from "../common/deploymenttype";
import { IDetails } from "../task/details";

export interface IReleaseHelper {

    getDefinition(projectName: string, definitionId: number): Promise<ReleaseDefinition>;
    getRelease(projectName: string, releaseId: number, stages: string[]): Promise<Release>;
    getReleaseStatus(projectName: string, releaseId: number): Promise<Release>;
    findRelease(projectName: string, definitionId: number, stages: string[], filter: IReleaseFilter): Promise<Release>;
    createRelease(projectName: string, definition: ReleaseDefinition, details: IDetails, stages?: string[], artifacts?: IArtifactFilter[]): Promise<Release>;
    getStageStatus(releaseStatus: Release, stageName: string): Promise<ReleaseEnvironment>;
    getArtifacts(projectName: string, definitionId: number, primaryId: string, versionId?: string, sourceBranch?: string): Promise<ArtifactMetadata[]>;
    getDefinitionStages(definition: ReleaseDefinition, stages: string[]): Promise<string[]>;
    getReleaseStages(release: Release, stages: string[]): Promise<string[]>;
    getStageApprovals(stage: ReleaseEnvironment, status: ApprovalStatus): Promise<ReleaseApproval[]>;
    getReleaseType(release: Release): Promise<DeploymentType>;
    updateStage(status: ReleaseEnvironmentUpdateMetadata, projectName: string, releaseId: number, stageId: number): Promise<ReleaseEnvironment>;
    updateApproval(status: ReleaseApproval, projectName: string, requestId: number): Promise<ReleaseApproval>;

}
