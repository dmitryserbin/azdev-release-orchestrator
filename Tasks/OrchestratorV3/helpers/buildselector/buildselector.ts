/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, BuildDefinition, BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IBuildSelector } from "./ibuildselector";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildParameters } from "../taskhelper/ibuildparameters";
import { IBuildFilter } from "../../workers/filtercreator/ibuildfilter";
import { IApiClient } from "../../common/iapiclient";
import { IResourcesFilter } from "../../workers/filtercreator/iresourcesfilter";

export class BuildSelector implements IBuildSelector {

    private debugLogger: IDebug;

    private apiClient: IApiClient;
    private buildApi: IBuildApiRetry;

    constructor(apiClient: IApiClient, buildApi: IBuildApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.apiClient = apiClient;
        this.buildApi = buildApi;

    }

    public async createBuild(projectName: string, definition: BuildDefinition, resourcesFilter: IResourcesFilter, stages?: string[], parameters?: IBuildParameters): Promise<Build> {

        const debug = this.debugLogger.extend(this.createBuild.name);

        const request: any = {

            resources: resourcesFilter,
            stagesToSkip: [],
            templateParameters: {},

        };

        if (Array.isArray(stages) && stages.length) {

            const definitionStages: string[] = await this.getStages(definition, request.sourceBranch, request.templateParameters);

            await this.confirmStages(definition, definitionStages, stages);

            const stagesToSkip: string[] = await this.getStagesToSkip(definitionStages, stages);

            request.stagesToSkip = stagesToSkip;

        }

        if (parameters && Object.keys(parameters).length) {

            request.templateParameters = parameters;

        }

        const run: any = await this.apiClient.post(`${projectName}/_apis/pipelines/${definition.id}/runs`, `5.1-preview.1`, request);

        if (!run) {

            throw new Error(`Unable to create <${definition.name}> (${definition.id}) definition run`);

        }

        const build: Build = await this.buildApi.getBuild(projectName, run.id);

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

    private async getStages(definition: BuildDefinition, sourceBranch?: string, parameters?: IBuildParameters): Promise<string[]> {

        const debug = this.debugLogger.extend(this.getStages.name);

        const body: unknown = {

            contributionIds: [
                "ms.vss-build-web.pipeline-run-parameters-data-provider",
            ],
            dataProviderContext: {
                properties: {
                    onlyFetchTemplateParameters: false,
                    pipelineId: definition.id,
                    sourceBranch: sourceBranch ? sourceBranch : "",
                    sourceVersion: "",
                    sourcePage: {
                        routeId: "ms.vss-build-web.pipeline-details-route",
                        routeValues: {
                            project: definition.project?.name,
                        },
                    },
                    templateParameters: (parameters && Object.keys(parameters).length) ? parameters : {},
                },
            },

        };

        const result: any = await this.apiClient.post(`_apis/Contribution/HierarchyQuery/project/${definition.project?.id}`, `5.0-preview.1`, body);

        const definitionStages: unknown[] = result.dataProviders["ms.vss-build-web.pipeline-run-parameters-data-provider"].stages;

        if (!Array.isArray(definitionStages) || !definitionStages.length) {

            throw new Error(`Unable to detect <${definition.name}> (${definition.id}) definition stages`);

        }

        const stages: string[] = definitionStages.map(
            (i) => i.name);

        debug(stages);

        return stages;

    }

    private async confirmStages(definition: BuildDefinition, stages: string[], required: string[]): Promise<void> {

        const debug = this.debugLogger.extend(this.confirmStages.name);

        if (!stages.length) {

            throw new Error(`No stages found in <${definition.name}> (${definition.id}) definition`);

        }

        for (const stage of required) {

            const match: string | undefined = stages.find(
                (i) => i.toLowerCase() === stage.toLowerCase());

            if (!match) {

                throw new Error(`Definition <${definition.name}> (${definition.id}) does not contain <${stage}> stage`);

            }

        }

    }

    private async getStagesToSkip(stages: string[], required: string[]): Promise<string[]> {

        const debug = this.debugLogger.extend(this.getStagesToSkip.name);

        const stagesToSkip: string[] = [];

        for (const stage of stages) {

            const match: string | undefined = required.find(
                (i) => i.toLowerCase() === stage.toLowerCase());

            if (!match) {

                stagesToSkip.push(stage);

            }

        }


        debug(stagesToSkip);

        return stagesToSkip;

    }

}
