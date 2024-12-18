import { IBuildApi } from "azure-devops-node-api/BuildApi"
import { Build, BuildQueryOrder, BuildReason, BuildResult, BuildStatus, QueryDeletedOption } from "azure-devops-node-api/interfaces/BuildInterfaces"

import { IBuildApiRetry } from "../interfaces/extensions/ibuildapiretry"
import { Retryable } from "../common/retry"

export class BuildApiRetry implements IBuildApiRetry {
	private buildApi: IBuildApi

	constructor(buildApi: IBuildApi) {
		this.buildApi = buildApi
	}

	@Retryable()
	public async getBuilds(
		project: string,
		definitions?: number[],
		queues?: number[],
		buildNumber?: string,
		minTime?: Date,
		maxTime?: Date,
		requestedFor?: string,
		reasonFilter?: BuildReason,
		statusFilter?: BuildStatus,
		resultFilter?: BuildResult,
		tagFilters?: string[],
		properties?: string[],
		top?: number,
		continuationToken?: string,
		maxBuildsPerDefinition?: number,
		deletedFilter?: QueryDeletedOption,
		queryOrder?: BuildQueryOrder,
		branchName?: string,
		buildIds?: number[],
		repositoryId?: string,
		repositoryType?: string,
	): Promise<Build[]> {
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
			repositoryType,
		)
	}
}
