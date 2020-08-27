import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { Build, BuildReason, BuildStatus, BuildResult, QueryDeletedOption, BuildQueryOrder } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildApiRetry extends Partial<IBuildApi> {

    getBuilds(project: string, definitions?: number[], queues?: number[], buildNumber?: string, minTime?: Date, maxTime?: Date, requestedFor?: string, reasonFilter?: BuildReason, statusFilter?: BuildStatus, resultFilter?: BuildResult, tagFilters?: string[], properties?: string[], top?: number, continuationToken?: string, maxBuildsPerDefinition?: number, deletedFilter?: QueryDeletedOption, queryOrder?: BuildQueryOrder, branchName?: string, buildIds?: number[], repositoryId?: string, repositoryType?: string): Promise<Build[]>;

}
