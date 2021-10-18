import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { Build, BuildReason, BuildStatus, BuildResult, QueryDeletedOption, BuildQueryOrder, BuildDefinition, BuildDefinitionReference, DefinitionQueryOrder, Timeline, UpdateStageParameters } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildApiRetry extends Partial<IBuildApi> {

    getBuild(project: string, buildId: number, propertyFilters?: string): Promise<Build>;
    getBuilds(project: string, definitions?: number[], queues?: number[], buildNumber?: string, minTime?: Date, maxTime?: Date, requestedFor?: string, reasonFilter?: BuildReason, statusFilter?: BuildStatus, resultFilter?: BuildResult, tagFilters?: string[], properties?: string[], top?: number, continuationToken?: string, maxBuildsPerDefinition?: number, deletedFilter?: QueryDeletedOption, queryOrder?: BuildQueryOrder, branchName?: string, buildIds?: number[], repositoryId?: string, repositoryType?: string): Promise<Build[]>;
    getBuildTimeline(project: string, buildId: number, timelineId?: string, changeId?: number, planId?: string): Promise<Timeline>;
    queueBuild(build: Build, project: string, ignoreWarnings?: boolean, checkInTicket?: string, sourceBuildId?: number, definitionId?: number): Promise<Build>;
    getDefinition(project: string, definitionId: number, revision?: number, minMetricsTime?: Date, propertyFilters?: string[], includeLatestBuilds?: boolean): Promise<BuildDefinition>;
    getDefinitions(project: string, name?: string, repositoryId?: string, repositoryType?: string, queryOrder?: DefinitionQueryOrder, top?: number, continuationToken?: string, minMetricsTime?: Date, definitionIds?: number[], path?: string, builtAfter?: Date, notBuiltAfter?: Date, includeAllProperties?: boolean, includeLatestBuilds?: boolean, taskIdFilter?: string, processType?: number, yamlFilename?: string): Promise<BuildDefinitionReference[]>;
    updateStage(updateParameters: UpdateStageParameters, buildId: number, stageRefName: string, project?: string): Promise<void>;

}
