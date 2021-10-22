/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, BuildDefinition, BuildQueryOrder, BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IBuildSelector } from "./ibuildselector";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildParameters } from "../taskhelper/ibuildparameters";
import { IBuildFilter } from "../../workers/filtercreator/ibuildfilter";
import { IResourcesFilter } from "../../workers/filtercreator/iresourcesfilter";
import { IRepositoryFilter } from "../../workers/filtercreator/irepositoryfilter";
import { IBuildWebApiRetry } from "../../extensions/buildwebapiretry/ibuildwebapiretry";
import { IRunStage } from "../../workers/runcreator/irunstage";
import { IPipelinesApiRetry } from "../../extensions/pipelinesapiretry/ipipelineapiretry";

export class BuildSelector implements IBuildSelector {

    private debugLogger: IDebug;

    private buildApi: IBuildApiRetry;
    private pipelinesApi: IPipelinesApiRetry;
    private buildWebApi: IBuildWebApiRetry;

    constructor(buildApi: IBuildApiRetry, pipelinesApi: IPipelinesApiRetry, buildWebApi: IBuildWebApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.buildApi = buildApi;
        this.pipelinesApi = pipelinesApi;
        this.buildWebApi = buildWebApi;

    }

    public async createBuild(definition: BuildDefinition, resourcesFilter: IResourcesFilter, stages?: string[], parameters?: IBuildParameters): Promise<Build> {

        const debug = this.debugLogger.extend(this.createBuild.name);

        const request: any = {

            resources: resourcesFilter,
            templateParameters: {},
            stagesToSkip: [],

        };

        if (Array.isArray(stages) && stages.length) {

            const definitionStages: string[] = await this.getStages(definition, resourcesFilter.repositories.self, parameters);

            await this.confirmStages(definition, definitionStages, stages);

            const stagesToSkip: string[] = await this.getStagesToSkip(definitionStages, stages);

            request.stagesToSkip = stagesToSkip;

        }

        if (parameters && Object.keys(parameters).length) {

            const definitionParameters: string[] = await this.getParameters(definition, resourcesFilter.repositories.self);

            await this.confirmParameters(definition, definitionParameters, parameters);

            request.templateParameters = parameters;

        }

        const run: any = await this.pipelinesApi.queueRun(definition, request);

        const build: Build = await this.buildApi.getBuild(definition.project!.name!, run.id);

        debug(build);

        return build;

    }

    public async getLatestBuild(definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build> {

        const debug = this.debugLogger.extend(this.getLatestBuild.name);

        const filteredBuilds: Build[] = await this.findBuilds(definition, filter, top);

        const latestBuild: Build = filteredBuilds.sort(
            (left, right) => left.id! - right.id!).reverse()[0];

        const build: Build = await this.buildApi.getBuild(definition.project!.name!, latestBuild.id!);

        debug(build);

        return build;

    }

    public async getSpecificBuild(definition: BuildDefinition, buildNumber: string): Promise<Build> {

        const debug = this.debugLogger.extend(this.getSpecificBuild.name);

        const matchingBuilds: Build[] = await this.buildApi.getBuilds(
            definition.project!.name!,
            [ definition.id! ],
            undefined,
            buildNumber);

        debug(matchingBuilds.map(
            (build) => `${build.buildNumber} (${build.id})`));

        if (matchingBuilds.length <= 0) {

            throw new Error(`Build <${buildNumber}> not found`);

        }

        const build: Build = await this.buildApi.getBuild(definition.project!.name!, matchingBuilds[0].id!);

        debug(build);

        return build;

    }

    public async getBuildStages(build: Build, stages: string[]): Promise<IRunStage[]> {

        const debug = this.debugLogger.extend(this.getBuildStages.name);

        const buildStages: IRunStage[] = [];

        const runDetails: any = await this.buildWebApi.getRunDetails(build);

        if (Array.isArray(runDetails.stages) && runDetails.stages.length) {

            debug(runDetails.stages);

            for (const stage of runDetails.stages) {

                // Do not auto target never started stages
                // Applicable to existing builds only
                const buildStage: IRunStage = {

                    name: stage.name!,
                    id: stage.id!,
                    target: stage.result !== 4 ? true : false,

                };

                if (stages.length) {

                    const match: string | undefined = stages.find(
                        (targetStage) => targetStage.toLowerCase() === buildStage.name.toLowerCase());

                    if (match) {

                        buildStage.target = true;

                    } else {

                        buildStage.target = false;

                    }

                }

                buildStages.push(buildStage);

            }

        }

        debug(buildStages);

        return buildStages;

    }

    public async cancelBuild(build: Build): Promise<Build> {

        const debug = this.debugLogger.extend(this.cancelBuild.name);

        const cancelRequest: Build = {

            status: BuildStatus.Cancelling,

        };

        const canceledBuild: Build = await this.buildApi.updateBuild(cancelRequest, build.project!.id!, build.id!, false);

        debug(canceledBuild);

        return canceledBuild;

    }

    private async findBuilds(definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build[]> {

        const debug = this.debugLogger.extend(this.findBuilds.name);

        debug(filter);

        let builds: Build[] = await this.buildApi.getBuilds(
            definition.project!.name!,
            [ definition.id! ],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            filter.buildResult,
            filter.tagFilters.length ? filter.tagFilters : undefined,
            undefined,
            top,
            undefined,
            undefined,
            undefined,
            BuildQueryOrder.QueueTimeDescending,
            filter.branchName,
            undefined,
            undefined,
            undefined);

        // Apply build status filter
        builds = builds.filter((build) => filter.buildStatus.find(
            (status) => status === build.status));

        if (!builds.length) {

            throw new Error(`No definition <${definition.name}> (${definition.id}) builds matching filter found`);

        }

        debug(`Found <${builds.length}> build(s) matching (${filter.buildStatus.map((status) => BuildStatus[status]).join(`|`)}) status filter`);

        debug(builds.map(
            (build) => `${build.buildNumber} | ${build.id} | ${BuildStatus[build.status!]}`));

        return builds;

    }

    private async getStages(definition: BuildDefinition, repository?: IRepositoryFilter, parameters?: IBuildParameters): Promise<string[]> {

        const debug = this.debugLogger.extend(this.getStages.name);

        const result: any = await this.buildWebApi.getRunParameters(definition, repository, parameters);

        const definitionStages: unknown[] = result.stages;

        if (!Array.isArray(definitionStages) || !definitionStages.length) {

            throw new Error(`Unable to detect <${definition.name}> (${definition.id}) definition stages`);

        }

        const stages: string[] = definitionStages.map(
            (i) => i.name);

        debug(stages);

        return stages;

    }

    private async confirmStages(definition: BuildDefinition, stages: string[], required: string[]): Promise<void> {

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

    private async getParameters(definition: BuildDefinition, repository?: IRepositoryFilter): Promise<string[]> {

        const debug = this.debugLogger.extend(this.getParameters.name);

        const result: any = await this.buildWebApi.getRunParameters(definition, repository);

        const templateParameters: unknown[] = result.templateParameters;

        if (!Array.isArray(templateParameters) || !templateParameters.length) {

            throw new Error(`Unable to detect <${definition.name}> (${definition.id}) definition template parameters`);

        }

        const parameters: string[] = templateParameters.map(
            (parameter) => parameter.name);

        debug(parameters);

        return parameters;

    }

    private async confirmParameters(definition: BuildDefinition, definitionParameters: string[], parameters: IBuildParameters): Promise<void> {

        if (!definitionParameters.length) {

            throw new Error(`No template parameters found in <${definition.name}> (${definition.id}) definition`);

        }

        for (const parameter of Object.keys(parameters)) {

            const match: string | undefined = definitionParameters.find(
                (i) => i.toLowerCase() === parameter.toLowerCase());

            if (!match) {

                throw new Error(`Definition <${definition.name}> (${definition.id}) does not contain <${parameter}> parameter`);

            }

        }

    }

}
