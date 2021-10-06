import { Build, BuildDefinition, BuildReason, BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../interfaces/loggers/logger";
import { IDebug } from "../interfaces/loggers/debug";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IBuildApiRetry } from "../interfaces/extensions/buildapiretry";
import { IBuildParameters } from "../interfaces/common/buildparameters";
import { IBuildFilter } from "../interfaces/common/buildfilter";

export class BuildHelper implements IBuildHelper {

    private debugLogger: IDebug;

    private buildApi: IBuildApiRetry;

    constructor(buildApi: IBuildApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.buildApi = buildApi;

    }

    public async getDefinition(projectName: string, definitionName: string): Promise<BuildDefinition> {

        const debug = this.debugLogger.extend(this.getDefinition.name);

        const matchingDefinitions: BuildDefinition[] = await this.buildApi.getDefinitions(projectName, definitionName);

        debug(matchingDefinitions.map(
            (definition) => `${definition.name} (${definition.id})`));

        if (matchingDefinitions.length <= 0) {

            throw new Error(`Definition <${definitionName}> not found`);

        }

        const targetDefinition: BuildDefinition = await this.buildApi.getDefinition(
            projectName,
            matchingDefinitions[0].id!);

        debug(targetDefinition);

        return targetDefinition;

    }

    public async createBuild(projectName: string, definition: BuildDefinition, parameters?: IBuildParameters): Promise<Build> {

        const debug = this.debugLogger.extend(this.createBuild.name);

        const request: Build = {

            definition: {

                id: definition.id!,

            },
            reason: BuildReason.Triggered,

        };

        if (parameters && Object.keys(parameters).length) {

            request.templateParameters = parameters;
        }

        const build: Build = await this.buildApi.queueBuild(request, projectName);

        debug(build);

        return build;

    }

    public async findBuilds(projectName: string, definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build[]> {

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

    public async getLatestBuild(projectName: string, definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build> {

        const debug = this.debugLogger.extend(this.getLatestBuild.name);

        const filteredBuilds: Build[] = await this.findBuilds(projectName, definition, filter, top);

        const latestBuild: Build = filteredBuilds.sort(
            (left, right) => left.id! - right.id!).reverse()[0];

        const build: Build = await this.buildApi.getBuild(projectName, latestBuild.id!);

        debug(build);

        return build;

    }

}
