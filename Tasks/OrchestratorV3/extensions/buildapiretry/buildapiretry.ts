import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { Build, BuildDefinition, BuildDefinitionReference, BuildQueryOrder, BuildReason, BuildResult, BuildStatus, DefinitionQueryOrder, QueryDeletedOption, Timeline, UpdateStageParameters } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildApiRetry } from "./ibuildapiretry";
import { Retryable } from "../../common/retry";
import { IApiClient } from "../../common/iapiclient";
import { IRestResponse } from "typed-rest-client";

export class BuildApiRetry implements IBuildApiRetry {

    private buildApi: IBuildApi;
    private apiClient: IApiClient;

    constructor(buildApi: IBuildApi, apiClient: IApiClient) {

        this.buildApi = buildApi;
        this.apiClient = apiClient;

    }

    @Retryable()
    public async getBuild(project: string, buildId: number, propertyFilters?: string): Promise<Build> {

        return await this.buildApi.getBuild(
            project,
            buildId,
            propertyFilters);

    }

    @Retryable()
    public async getBuilds(project: string, definitions?: number[], queues?: number[], buildNumber?: string, minTime?: Date, maxTime?: Date, requestedFor?: string, reasonFilter?: BuildReason, statusFilter?: BuildStatus, resultFilter?: BuildResult, tagFilters?: string[], properties?: string[], top?: number, continuationToken?: string, maxBuildsPerDefinition?: number, deletedFilter?: QueryDeletedOption, queryOrder?: BuildQueryOrder, branchName?: string, buildIds?: number[], repositoryId?: string, repositoryType?: string): Promise<Build[]> {

        return await this.buildApi.getBuilds(
            project,
            definitions,
            queues,
            buildNumber,
            minTime,
            maxTime,
            requestedFor,
            reasonFilter,
            statusFilter,
            resultFilter,
            tagFilters,
            properties,
            top,
            continuationToken,
            maxBuildsPerDefinition,
            deletedFilter,
            queryOrder,
            branchName,
            buildIds,
            repositoryId,
            repositoryType);

    }

    @Retryable()
    public async getBuildTimeline(project: string, buildId: number, timelineId?: string, changeId?: number, planId?: string): Promise<Timeline> {

        return await this.buildApi.getBuildTimeline(
            project,
            buildId,
            timelineId,
            changeId,
            planId);

    }

    @Retryable()
    public async queueBuild(build: Build, project: string, ignoreWarnings?: boolean, checkInTicket?: string, sourceBuildId?: number, definitionId?: number): Promise<Build> {

        return await this.buildApi.queueBuild(
            build,
            project,
            ignoreWarnings,
            checkInTicket,
            sourceBuildId,
            definitionId);

    }

    @Retryable()
    public async updateBuild(build: Build, project: string, buildId: number, retry?: boolean): Promise<Build> {

        return await this.buildApi.updateBuild(
            build,
            project,
            buildId,
            retry);

    }

    @Retryable()
    public async getDefinition(project: string, definitionId: number, revision?: number, minMetricsTime?: Date, propertyFilters?: string[], includeLatestBuilds?: boolean): Promise<BuildDefinition> {

        return await this.buildApi.getDefinition(
            project,
            definitionId,
            revision,
            minMetricsTime,
            propertyFilters,
            includeLatestBuilds);

    }

    @Retryable()
    public async getDefinitions(project: string, name?: string, repositoryId?: string, repositoryType?: string, queryOrder?: DefinitionQueryOrder, top?: number, continuationToken?: string, minMetricsTime?: Date, definitionIds?: number[], path?: string, builtAfter?: Date, notBuiltAfter?: Date, includeAllProperties?: boolean, includeLatestBuilds?: boolean, taskIdFilter?: string, processType?: number, yamlFilename?: string): Promise<BuildDefinitionReference[]> {

        return await this.buildApi.getDefinitions(
            project,
            name,
            repositoryId,
            repositoryType,
            queryOrder,
            top,
            continuationToken,
            minMetricsTime,
            definitionIds,
            path,
            builtAfter,
            notBuiltAfter,
            includeAllProperties,
            includeLatestBuilds,
            taskIdFilter,
            processType,
            yamlFilename);

    }

    // BuildApi uses old API version which does not support forceRetryAllJobs parameter
    // Therefore using our own implementation to make updateStage REST call
    @Retryable()
    public async updateStage(updateParameters: UpdateStageParameters, buildId: number, stageRefName: string, project?: string): Promise<void> {

        const run: unknown = await this.apiClient.patch(`${project}/_apis/build/builds/${buildId}/stages/${stageRefName}`, "7.1-preview.1", updateParameters, true);

        const responseCode: number | undefined = (run as IRestResponse<number>).statusCode;

        const validResponseCodes: number[] = [ 200, 204 ];

        if (!responseCode || !validResponseCodes.includes(responseCode)) {

            throw new Error(`Unable to update <${stageRefName}> stage status`);

        }

    }

}
