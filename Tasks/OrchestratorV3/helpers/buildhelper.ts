import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IBuildApiRetry } from "../interfaces/extensions/buildapiretry";
import { IDetails } from "../interfaces/task/details";
import { IBuildParameters } from "../interfaces/common/buildparameters";

export class BuildHelper implements IBuildHelper {

    private debugLogger: IDebugLogger;

    private buildApi: IBuildApiRetry;

    constructor(buildApi: IBuildApiRetry, debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

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

    public async createBuild(projectName: string, definition: BuildDefinition, details: IDetails, stages?: string[], parameters?: IBuildParameters): Promise<Build> {

        const debug = this.debugLogger.extend(this.createBuild.name);

        const request: Build = {

            definition: {

                id: definition.id!,

            },

        };

        if (parameters && Object.keys(parameters).length) {

            request.templateParameters = parameters;
        }

        const build: Build = await this.buildApi.queueBuild(request, projectName);

        debug(build);

        return build;

    }

}
