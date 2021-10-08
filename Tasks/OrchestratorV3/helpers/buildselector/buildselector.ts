import { Build, BuildDefinition, BuildReason, BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IBuildSelector } from "./ibuildselector";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildParameters } from "../taskhelper/ibuildparameters";
import { IBuildFilter } from "../../workers/filtercreator/ibuildfilter";
import { IFilters } from "../taskhelper/ifilters";
import { IApiClient } from "../../common/iapiclient";

export class BuildSelector implements IBuildSelector {

    private debugLogger: IDebug;

    private apiClient: IApiClient;
    private buildApi: IBuildApiRetry;

    constructor(apiClient: IApiClient, buildApi: IBuildApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.apiClient = apiClient;
        this.buildApi = buildApi;

    }

    public async createBuild(projectName: string, definition: BuildDefinition, filters: IFilters, stages?: string[], parameters?: IBuildParameters): Promise<Build> {

        const debug = this.debugLogger.extend(this.createBuild.name);

        const request: Build = {

            definition: {

                id: definition.id!,

            },
            reason: BuildReason.Triggered,

        };

        if (filters.sourceBranch) {

            request.sourceBranch = `refs/heads/${filters.sourceBranch}`;

        }

        if (parameters && Object.keys(parameters).length) {

            request.templateParameters = parameters;
        }

        const build: Build = await this.buildApi.queueBuild(request, projectName);

        debug(build);

        return build;

    }

    public async getLatestBuild(projectName: string, definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build> {

        const debug = this.debugLogger.extend(this.getLatestBuild.name);

        const filteredBuilds: Build[] = await this.findBuilds(projectName, definition, filter, top);

        const latestBuild: Build = filteredBuilds.sort(
            (left, right) => left.id! - right.id!).reverse()[0];

        const build: Build = await this.buildApi.getBuild(projectName, latestBuild.id!);

        debug(build);

        return build;

    }

    public async getSpecificBuild(projectName: string, definition: BuildDefinition, buildNumber: string): Promise<Build> {

        const debug = this.debugLogger.extend(this.getSpecificBuild.name);

        const matchingBuilds: Build[] = await this.buildApi.getBuilds(
            projectName,
            [ definition.id! ],
            undefined,
            buildNumber
        );

        debug(matchingBuilds.map(
            (build) => `${build.buildNumber} (${build.id})`));

        if (matchingBuilds.length <= 0) {

            throw new Error(`Build <${buildNumber}> not found`);

        }

        const build: Build = await this.buildApi.getBuild(projectName, matchingBuilds[0].id!);

        debug(build);

        return build;

    }

    private async findBuilds(projectName: string, definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build[]> {

        const debug = this.debugLogger.extend(this.findBuilds.name);

        debug(filter);

        const builds: Build[] = await this.buildApi.getBuilds(
            projectName,
            [ definition.id! ],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            filter.buildStatus,
            undefined,
            undefined,
            undefined,
            top,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined);

        if (!builds.length) {

            throw new Error(`No definition <${definition.name}> (${definition.id}) builds matching filter found`);

        }

        debug(`Found <${builds.length}> (${BuildStatus[filter.buildStatus]}) build(s) matching filter`);

        debug(builds.map(
            (build) => `${build.buildNumber} (${build.id})`));

        return builds;

    }

}
