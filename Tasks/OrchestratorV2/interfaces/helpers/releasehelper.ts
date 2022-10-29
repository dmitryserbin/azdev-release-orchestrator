import { ApprovalStatus, Artifact, ArtifactMetadata, Release, ReleaseApproval, ReleaseDefinition, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseFilter } from "../common/releasefilter";
import { IArtifactFilter } from "../common/artifactfilter";
import { DeploymentType } from "../common/deploymenttype";
import { IReleaseVariable } from "../common/releasevariable";
import { IDetails } from "../task/details";

export interface IReleaseHelper {

    getDefinition(projectName: string, definitionName: string): Promise<ReleaseDefinition>;
    getRelease(projectName: string, definitionId: number, releaseName: string, stages: string[]): Promise<Release>;
    findReleases(projectName: string, definitionName: string, definitionId: number, filter: IReleaseFilter, top: number): Promise<Release[]>;
    getLastRelease(projectName: string, definitionName: string, definitionId: number, stages: string[], filter: IReleaseFilter, top: number): Promise<Release>;
    createRelease(projectName: string, definition: ReleaseDefinition, details: IDetails, stages?: string[], variables?: IReleaseVariable[], artifacts?: IArtifactFilter[]): Promise<Release>;
    getReleaseStatus(projectName: string, releaseId: number): Promise<Release>;
    getStageStatus(releaseStatus: Release, stageName: string): Promise<ReleaseEnvironment>;
    getArtifacts(projectName: string, definitionId: number, primaryId: string, versionId?: string, branchName?: string): Promise<ArtifactMetadata[]>;
    getDefinitionStages(definition: ReleaseDefinition, stages: string[]): Promise<string[]>;
    getDefinitionPrimaryArtifact(definition: ReleaseDefinition, type: string): Promise<Artifact | undefined>;
    getReleaseStages(release: Release, stages: string[]): Promise<string[]>;
    getStageApprovals(stage: ReleaseEnvironment, status: ApprovalStatus): Promise<ReleaseApproval[]>;
    getReleaseType(release: Release): Promise<DeploymentType>;
    startStage(stage: ReleaseEnvironment, projectName: string, message: string): Promise<ReleaseEnvironment>;
    cancelStage(stage: ReleaseEnvironment, projectName: string, message: string): Promise<ReleaseEnvironment>;
    approveStage(releaseApproval: ReleaseApproval, projectName: string, message: string): Promise<ReleaseApproval>;

}
