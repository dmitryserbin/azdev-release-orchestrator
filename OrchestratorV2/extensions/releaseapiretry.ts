import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { ReleaseDefinition, Release, ReleaseExpands, ReleaseStatus, ReleaseStartMetadata, ArtifactVersionQueryResult, ReleaseEnvironmentUpdateMetadata, ReleaseEnvironment, ReleaseApproval } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { Retryable } from "../common/retry";
import { IReleaseApiRetry } from "../interfaces/extensions/releaseapiretry";

export class ReleaseApiRetry implements IReleaseApiRetry {

    private releaseApi: IReleaseApi;

    constructor(releaseApi: IReleaseApi) {

        this.releaseApi = releaseApi;

    }

    @Retryable()
    public async getReleaseDefinitionRetry(project: string, definitionId: number): Promise<ReleaseDefinition> {

        return await this.releaseApi.getReleaseDefinition(project, definitionId);

    }

    @Retryable()
    public async getReleaseRetry(project: string, releaseId: number): Promise<Release> {

        return await this.releaseApi.getRelease(project, releaseId);

    }

    @Retryable()
    public async getReleasesRetry(project: string, definitionId: number, statusFilter: ReleaseStatus, artifactVersionId?: string, sourceBranchFilter?: string, tagFilter?: string[]): Promise<Release[]> {

        return await this.releaseApi.getReleases(
            project,
            definitionId,
            undefined,
            undefined,
            undefined,
            statusFilter,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ReleaseExpands.Artifacts,
            undefined,
            undefined,
            artifactVersionId ? artifactVersionId : undefined,
            sourceBranchFilter ? sourceBranchFilter : undefined,
            undefined,
            (tagFilter && tagFilter.length) ? tagFilter : undefined);

    }

    @Retryable()
    public async createReleaseRetry(releaseStartMetadata: ReleaseStartMetadata, project: string): Promise<Release> {

        return await this.releaseApi.createRelease(releaseStartMetadata, project);

    }

    @Retryable()
    public async getArtifactVersionsRetry(project: string, releaseDefinitionId: number): Promise<ArtifactVersionQueryResult> {

        return await this.releaseApi.getArtifactVersions(project, releaseDefinitionId);

    }

    @Retryable()
    public async updateReleaseEnvironmentRetry(environmentUpdateData: ReleaseEnvironmentUpdateMetadata, project: string, releaseId: number, environmentId: number): Promise<ReleaseEnvironment> {

        return await this.releaseApi.updateReleaseEnvironment(environmentUpdateData, project, releaseId, environmentId);

    }

    @Retryable()
    public async updateReleaseApprovalRetry(approval: ReleaseApproval, project: string, approvalId: number): Promise<ReleaseApproval> {

        return await this.releaseApi.updateReleaseApproval(approval, project, approvalId);

    }

}
