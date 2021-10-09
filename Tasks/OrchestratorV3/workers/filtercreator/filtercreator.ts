import { BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildFilter } from "./ibuildfilter";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IFilterCreator } from "./ifiltercreator";
import { IResourcesFilter } from "./iresourcesfilter";
import { IFilters } from "../../helpers/taskhelper/ifilters";

export class FilterCreator implements IFilterCreator {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public async createResourcesFilter(filters: IFilters): Promise<IResourcesFilter> {

        const resourcesFilter: IResourcesFilter = {

            repositories: {
                self: {
                    refName: `refs/heads/master`,
                },
            },
            pipelines: {},

        }

        if (filters.sourceBranch) {

            resourcesFilter.repositories.self.refName = `refs/heads/${filters.sourceBranch}`;

        }

        return resourcesFilter;

    }

    public async createBuildFilter(): Promise<IBuildFilter> {

        const debug = this.debugLogger.extend(this.createBuildFilter.name);

        const buildFilter: IBuildFilter = {

            buildStatus: BuildStatus.Completed,

        };

        debug(buildFilter);

        return buildFilter;

    }

}
