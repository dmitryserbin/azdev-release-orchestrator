import { ReleaseDefinition, Release, ArtifactMetadata, ReleaseEnvironment, ReleaseApproval, ApprovalStatus, Artifact } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseFilter } from "../common/releasefilter";
import { IArtifactFilter } from "../common/artifactfilter";
import { DeploymentType } from "../common/deploymenttype";
import { IDetails } from "../task/details";
import { IReleaseVariable } from "../common/releasevariable";

export interface IReleaseHelper {

    getDefinition(projectName: string, definitionId: number): Promise<ReleaseDefinition>;
    getRelease(projectName: string, releaseId: number, stages: string[]): Promise<Release>;
    findReleases(projectName: string, definitionId: number, filter: IReleaseFilter): Promise<Release[]>;
    getLastRelease(projectName: string, definitionId: number, stages: string[], filter: IReleaseFilter): Promise<Release>;
    createRelease(projectName: string, definition: ReleaseDefinition, details: IDetails, stages?: string[], variables?: IReleaseVariable[], artifacts?: IArtifactFilter[]): Promise<Release>;
    getReleaseStatus(projectName: string, releaseId: number): Promise<Release>;
    getStageStatus(releaseStatus: Release, stageName: string): Promise<ReleaseEnvironment>;
    getArtifacts(projectName: string, definitionId: number, primaryId: string, versionId?: string, sourceBranch?: string): Promise<ArtifactMetadata[]>;
    getDefinitionStages(definition: ReleaseDefinition, stages: string[]): Promise<string[]>;
    getDefinitionPrimaryArtifact(definition: ReleaseDefinition, type: string): Promise<Artifact>;
    getReleaseStages(release: Release, stages: string[]): Promise<string[]>;
    getStageApprovals(stage: ReleaseEnvironment, status: ApprovalStatus): Promise<ReleaseApproval[]>;
    getReleaseType(release: Release): Promise<DeploymentType>;
    startStage(stage: ReleaseEnvironment, projectName: string, message: string): Promise<ReleaseEnvironment>;
    cancelStage(stage: ReleaseEnvironment, projectName: string, message: string): Promise<ReleaseEnvironment>;
    approveStage(releaseApproval: ReleaseApproval, projectName: string, message: string): Promise<ReleaseApproval>;

}