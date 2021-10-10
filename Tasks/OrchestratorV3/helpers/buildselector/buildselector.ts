/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, BuildDefinition, BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IBuildSelector } from "./ibuildselector";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildParameters } from "../taskhelper/ibuildparameters";
import { IBuildFilter } from "../../workers/filtercreator/ibuildfilter";
import { IResourcesFilter } from "../../workers/filtercreator/iresourcesfilter";
import { IRepositoryFilter } from "../../workers/filtercreator/irepositoryfilter";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";

export class BuildSelector implements IBuildSelector {

    private debugLogger: IDebug;

    private buildApi: IBuildApiRetry;
    private runApi: IRunApiRetry;

    constructor(buildApi: IBuildApiRetry, runApi: IRunApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.buildApi = buildApi;
        this.runApi = runApi;

    }

    public async createBuild(definition: BuildDefinition, resourcesFilter: IResourcesFilter, stages?: string[], parameters?: IBuildParameters): Promise<Build> {

        const debug = this.debugLogger.extend(this.createBuild.name);

        const request: any = {

            resources: resourcesFilter,
            templateParameters: (parameters && Object.keys(parameters).length) ? parameters : {},
            stagesToSkip: [],

        };

        if (Array.isArray(stages) && stages.length) {

            const definitionStages: string[] = await this.getStages(definition, resourcesFilter.repositories.self, parameters);

            await this.confirmStages(definition, definitionStages, stages);

            const stagesToSkip: string[] = await this.getStagesToSkip(definitionStages, stages);

            request.stagesToSkip = stagesToSkip;

        }

        const run: any = await this.runApi.queueRun(definition, request);

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
            buildNumber
        );

        debug(matchingBuilds.map(
            (build) => `${build.buildNumber} (${build.id})`));

        if (matchingBuilds.length <= 0) {

            throw new Error(`Build <${buildNumber}> not found`);

        }

        const build: Build = await this.buildApi.getBuild(definition.project!.name!, matchingBuilds[0].id!);

        debug(build);

        return build;

    }

    public async getBuildStages(build: Build, stages: string[]): Promise<{ [key: string]: boolean }> {

        const debug = this.debugLogger.extend(this.getBuildStages.name);

        let buildStages: string[] = [];

        const runDetails: any = await this.runApi.getRunDetails(build);

        if (Array.isArray(runDetails.stages) && runDetails.stages.length) {

            debug(runDetails.stages);

            buildStages = runDetails.stages!.map(
                (stage: any) => stage.name!);

        }

        const targetStages: { [key: string]: boolean } = {};

        buildStages.map((stage) => {

            let target: boolean = true;

            // Detect non-target stages
            if (stages.length) {

                const match: string | undefined = stages.find(
                    (i) => i.toLowerCase() === stage.toLowerCase());

                if (!match) {

                    target = false;

                }

            }

            targetStages[stage] = target;

        });

        debug(targetStages);

        return targetStages;

    }

    private async findBuilds(definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build[]> {

        const debug = this.debugLogger.extend(this.findBuilds.name);

        debug(filter);

        const builds: Build[] = await this.buildApi.getBuilds(
            definition.project!.name!,
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

    private async getStages(definition: BuildDefinition, repository?: IRepositoryFilter, parameters?: IBuildParameters): Promise<string[]> {

        const debug = this.debugLogger.extend(this.getStages.name);

        const result: any = await this.runApi.getRunParameters(definition, repository, parameters);

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
