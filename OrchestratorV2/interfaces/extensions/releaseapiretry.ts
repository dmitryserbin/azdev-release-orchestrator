import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { ReleaseDefinition, Release, ReleaseStatus, ReleaseStartMetadata, ArtifactVersionQueryResult, ReleaseEnvironmentUpdateMetadata, ReleaseEnvironment, ReleaseApproval, ApprovalFilters, SingleReleaseExpands, ReleaseQueryOrder, ReleaseExpands, ReleaseDefinitionExpands, ReleaseDefinitionQueryOrder } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IReleaseApiRetry extends Partial<IReleaseApi> {

    getReleaseDefinition(project: string, definitionId: number, propertyFilters?: string[]): Promise<ReleaseDefinition>;
    getReleaseDefinitions(project: string, searchText?: string, expand?: ReleaseDefinitionExpands, artifactType?: string, artifactSourceId?: string, top?: number, continuationToken?: string, queryOrder?: ReleaseDefinitionQueryOrder, path?: string, isExactNameMatch?: boolean, tagFilter?: string[], propertyFilters?: string[], definitionIdFilter?: string[], isDeleted?: boolean, searchTextContainsFolderName?: boolean): Promise<ReleaseDefinition[]>;
    getRelease(project: string, releaseId: number, approvalFilters?: ApprovalFilters, propertyFilters?: string[], expand?: SingleReleaseExpands, topGateRecords?: number): Promise<Release>;
    getReleases(project?: string, definitionId?: number, definitionEnvironmentId?: number, searchText?: string, createdBy?: string, statusFilter?: ReleaseStatus, environmentStatusFilter?: number, minCreatedTime?: Date, maxCreatedTime?: Date, queryOrder?: ReleaseQueryOrder, top?: number, continuationToken?: number, expand?: ReleaseExpands, artifactTypeId?: string, sourceId?: string, artifactVersionId?: string, sourceBranchFilter?: string, isDeleted?: boolean, tagFilter?: string[], propertyFilters?: string[], releaseIdFilter?: number[], path?: string): Promise<Release[]>;
    createRelease(releaseStartMetadata: ReleaseStartMetadata, project: string): Promise<Release>;
    getArtifactVersions(project: string, releaseDefinitionId: number): Promise<ArtifactVersionQueryResult>;
    updateReleaseEnvironment(environmentUpdateData: ReleaseEnvironmentUpdateMetadata, project: string, releaseId: number, environmentId: number): Promise<ReleaseEnvironment>;
    updateReleaseApproval(approval: ReleaseApproval, project: string, approvalId: number): Promise<ReleaseApproval>;

}
