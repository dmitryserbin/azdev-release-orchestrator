import { BuildResult, BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildFilter } from "./ibuildfilter";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IFilterCreator } from "./ifiltercreator";
import { IResourcesFilter } from "./iresourcesfilter";
import { IFilters } from "../../helpers/taskhelper/ifilters";
import { IRepositoryFilter } from "./irepositoryfilter";
import { IPipelineFilter } from "./ipipelinefilter";

export class FilterCreator implements IFilterCreator {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public async createResourcesFilter(filters: IFilters): Promise<IResourcesFilter> {

        const debug = this.debugLogger.extend(this.createResourcesFilter.name);

        const resourcesFilter: IResourcesFilter = {

            repositories: {},
            pipelines: {},

        }

        if (filters.branchName) {

            const self: IRepositoryFilter = {

                refName: `refs/heads/${filters.branchName}`,
                version: ``,

            };

            resourcesFilter.repositories["self"] = self;

        }

        if (Object.keys(filters.pipelineResources).length) {

            for (const resource of Object.keys(filters.pipelineResources)) {

                const pipelineFilter: IPipelineFilter = {

                    version: filters.pipelineResources[resource],

                };

                resourcesFilter.pipelines[resource] = pipelineFilter;

            }

        }

        if (Object.keys(filters.repositoryResources).length) {

            for (const resource of Object.keys(filters.repositoryResources)) {

                const repositoryFilter: IRepositoryFilter = {

                    refName: `refs/heads/${filters.repositoryResources[resource]}`,
                    version: ``,

                };

                resourcesFilter.repositories[resource] = repositoryFilter;

            }

        }

        debug(resourcesFilter);

        return resourcesFilter;

    }

    public async createBuildFilter(filters: IFilters): Promise<IBuildFilter> {

        const debug = this.debugLogger.extend(this.createBuildFilter.name);

        const buildFilter: IBuildFilter = {

            buildStatus: [
                BuildStatus.Completed,
                BuildStatus.NotStarted,
                BuildStatus.None,
            ],
            buildResult: filters.buildResult ? (<never>BuildResult)[filters.buildResult] : undefined,
            tagFilters: filters.buildTags,
            branchName: filters.branchName ? `refs/heads/${filters.branchName}` : "",

        };

        debug(buildFilter);

        return buildFilter;

    }

}
