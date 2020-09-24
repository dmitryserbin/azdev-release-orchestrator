import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { ReleaseDefinition, Release, ReleaseExpands, ReleaseStatus, ReleaseStartMetadata, ArtifactVersionQueryResult, ReleaseEnvironmentUpdateMetadata, ReleaseEnvironment, ReleaseApproval, ApprovalFilters, SingleReleaseExpands, ReleaseQueryOrder, ReleaseDefinitionExpands, ReleaseDefinitionQueryOrder } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { Retryable } from "../common/retry";
import { IReleaseApiRetry } from "../interfaces/extensions/releaseapiretry";

export class ReleaseApiRetry implements IReleaseApiRetry {

    private releaseApi: IReleaseApi;

    constructor(releaseApi: IReleaseApi) {

        this.releaseApi = releaseApi;

    }

    @Retryable()
    public async getReleaseDefinition(project: string, definitionId: number, propertyFilters?: string[]): Promise<ReleaseDefinition> {

        return await this.releaseApi.getReleaseDefinition(
            project,
            definitionId,
            propertyFilters);

    }

    @Retryable()
    public async getReleaseDefinitions(project: string, searchText?: string, expand?: ReleaseDefinitionExpands, artifactType?: string, artifactSourceId?: string, top?: number, continuationToken?: string, queryOrder?: ReleaseDefinitionQueryOrder, path?: string, isExactNameMatch?: boolean, tagFilter?: string[], propertyFilters?: string[], definitionIdFilter?: string[], isDeleted?: boolean, searchTextContainsFolderName?: boolean): Promise<ReleaseDefinition[]> {

        return await this.releaseApi.getReleaseDefinitions(
            project,
            searchText,
            expand,
            artifactType,
            artifactSourceId,
            top,
            continuationToken,
            queryOrder,
            path,
            isExactNameMatch,
            tagFilter,
            propertyFilters,
            definitionIdFilter,
            isDeleted,
            searchTextContainsFolderName);

    }

    @Retryable()
    public async getRelease(project: string, releaseId: number, approvalFilters?: ApprovalFilters, propertyFilters?: string[], expand?: SingleReleaseExpands, topGateRecords?: number): Promise<Release> {

        return await this.releaseApi.getRelease(
            project,
            releaseId,
            approvalFilters,
            propertyFilters,
            expand,
            topGateRecords);

    }

    @Retryable()
    public async getReleases(project?: string, definitionId?: number, definitionEnvironmentId?: number, searchText?: string, createdBy?: string, statusFilter?: ReleaseStatus, environmentStatusFilter?: number, minCreatedTime?: Date, maxCreatedTime?: Date, queryOrder?: ReleaseQueryOrder, top?: number, continuationToken?: number, expand?: ReleaseExpands, artifactTypeId?: string, sourceId?: string, artifactVersionId?: string, sourceBranchFilter?: string, isDeleted?: boolean, tagFilter?: string[], propertyFilters?: string[], releaseIdFilter?: number[], path?: string): Promise<Release[]> {

        return await this.releaseApi.getReleases(
            project,
            definitionId,
            definitionEnvironmentId,
            searchText,
            createdBy,
            statusFilter,
            environmentStatusFilter,
            minCreatedTime,
            maxCreatedTime,
            queryOrder,
            top,
            continuationToken,
            expand,
            artifactTypeId,
            sourceId,
            artifactVersionId,
            sourceBranchFilter,
            isDeleted,
            tagFilter,
            propertyFilters,
            releaseIdFilter,
            path);

    }

    @Retryable()
    public async createRelease(releaseStartMetadata: ReleaseStartMetadata, project: string): Promise<Release> {

        return await this.releaseApi.createRelease(releaseStartMetadata, project);

    }

    @Retryable()
    public async getArtifactVersions(project: string, releaseDefinitionId: number): Promise<ArtifactVersionQueryResult> {

        return await this.releaseApi.getArtifactVersions(project, releaseDefinitionId);

    }

    @Retryable()
    public async updateReleaseEnvironment(environmentUpdateData: ReleaseEnvironmentUpdateMetadata, project: string, releaseId: number, environmentId: number): Promise<ReleaseEnvironment> {

        return await this.releaseApi.updateReleaseEnvironment(environmentUpdateData, project, releaseId, environmentId);

    }

    // Do not use REST API retry for approvals
    // Rely on approval retry mechanism instead
    public async updateReleaseApproval(approval: ReleaseApproval, project: string, approvalId: number): Promise<ReleaseApproval> {

        return await this.releaseApi.updateReleaseApproval(approval, project, approvalId);

    }

}
