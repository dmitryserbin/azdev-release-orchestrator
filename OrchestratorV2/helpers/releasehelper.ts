import Debug from "debug";

import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { ReleaseDefinition, Release, ReleaseStatus, ReleaseExpands } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseFilter } from "../interfaces/orchestrator/releasefilter";

export class ReleaseHelper implements IReleaseHelper {

    private debugLogger: Debug.Debugger;

    private releaseApi: IReleaseApi;

    constructor(releaseApi: IReleaseApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.releaseApi = releaseApi;

    }

    public async getDefinition(projectName: string, definitionId: number): Promise<ReleaseDefinition> {

        const debug = this.debugLogger.extend(this.getDefinition.name);

        const targetDefinition: ReleaseDefinition = await this.releaseApi.getReleaseDefinition(projectName, definitionId);

        if (!targetDefinition) {

            throw new Error(`Definition <${definitionId}> not found`);

        }

        debug(targetDefinition);

        return targetDefinition;

    }

    public async getRelease(projectName: string, releaseId: number, stages: string[]): Promise<Release> {

        const debug = this.debugLogger.extend(this.getRelease.name);

        const targetRelease: Release = await this.releaseApi.getRelease(projectName, releaseId);

        if (!targetRelease) {

            throw new Error(`Release <${releaseId}> not found`);

        }

        const targetStages: string[] = targetRelease.environments!.map((i) => i.name!);

        await this.validateStages(stages, targetStages);

        debug(targetRelease);

        return targetRelease;

    }

    public async findRelease(projectName: string, definitionId: number, stages: string[], filter: IReleaseFilter): Promise<Release> {

        const debug = this.debugLogger.extend(this.findRelease.name);

        const availableReleases: Release[] = await this.releaseApi.getReleases(
            projectName,
            definitionId,
            undefined,
            undefined,
            undefined,
            ReleaseStatus.Active,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ReleaseExpands.Artifacts,
            undefined,
            undefined,
            filter.artifactVersion ? filter.artifactVersion : undefined,
            filter.sourceBranch ? filter.sourceBranch : undefined,
            undefined,
            (filter.tag && filter.tag.length) ? filter.tag : undefined);

        if (!availableReleases) {

            throw new Error(`No ${projectName} project ${definitionId} definition releases found`);

        }

        if (availableReleases.length <= 0) {

            if (filter.tag || filter.artifactVersion || filter.sourceBranch) {

                throw new Error(`No active releases matching filter (tags: ${filter.tag}, artifact: ${filter.artifactVersion}, branch: ${filter.sourceBranch}) criteria found`);

            } else {

                throw new Error(`No active releases found`);

            }

        }

        // Find latest release by ID
        const filteredRelease: Release = availableReleases.sort((left, right) => left.id! - right.id!).reverse()[0];

        const targetRelease: Release = await this.releaseApi.getRelease(projectName, filteredRelease.id!);

        const targetStages: string[] = targetRelease.environments!.map((i) => i.name!);

        await this.validateStages(stages, targetStages);

        debug(targetRelease);

        return targetRelease;

    }

    public async getStages(release: Release, stages: string[]): Promise<string[]> {

        const debug = this.debugLogger.extend(this.getStages.name);

        const releaseStages: string[] = release.environments!.map((i) => i.name!);

        const targetStages: string[] = (stages && stages.length > 0)
            ? stages : releaseStages;

        debug(targetStages);

        return targetStages;

    }

    private async validateStages(required: string[], existing: string[]): Promise<void> {

        const debug = this.debugLogger.extend(this.validateStages.name);

        for (const stage of required) {

            if (existing.indexOf(stage) === -1) {

                throw new Error(`Release does not contain <${stage}> stage`);

            }

        }

    }

}
