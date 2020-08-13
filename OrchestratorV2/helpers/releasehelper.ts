import Debug from "debug";

import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ReleaseDefinition, Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";

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

    public async getRelease(project: TeamProject, releaseId: number, stages: string[]): Promise<Release> {

        const debug = this.debugLogger.extend(this.getRelease.name);

        const targetRelease: Release = await this.releaseApi.getRelease(project.name!, releaseId);

        if (!targetRelease) {

            throw new Error(`Release <${releaseId}> not found`);

        }

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
