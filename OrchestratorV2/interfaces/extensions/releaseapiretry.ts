import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { ReleaseDefinition, Release, ReleaseStatus, ReleaseStartMetadata, ArtifactVersionQueryResult, ReleaseEnvironmentUpdateMetadata, ReleaseEnvironment, ReleaseApproval } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IReleaseApiRetry extends Partial<IReleaseApi> {

    getReleaseDefinitionRetry(project: string, definitionId: number): Promise<ReleaseDefinition>;
    getReleaseRetry(project: string, releaseId: number): Promise<Release>;
    getReleasesRetry(project: string, definitionId: number, statusFilter: ReleaseStatus, artifactVersionId?: string, sourceBranchFilter?: string, tagFilter?: string[]): Promise<Release[]>;
    createReleaseRetry(releaseStartMetadata: ReleaseStartMetadata, project: string): Promise<Release>;
    getArtifactVersionsRetry(project: string, releaseDefinitionId: number): Promise<ArtifactVersionQueryResult>;
    updateReleaseEnvironmentRetry(environmentUpdateData: ReleaseEnvironmentUpdateMetadata, project: string, releaseId: number, environmentId: number): Promise<ReleaseEnvironment>;
    updateReleaseApprovalRetry(approval: ReleaseApproval, project: string, approvalId: number): Promise<ReleaseApproval>;

}
