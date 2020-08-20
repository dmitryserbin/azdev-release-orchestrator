import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IBuildApiRetry } from "../interfaces/extensions/buildapiretry";
import { BuildApiRetry } from "../extensions/buildapiretry";

export class BuildHelper implements IBuildHelper {

    private debugLogger: IDebugLogger;

    private buildApi: IBuildApi;
    private buildApiRetry: IBuildApiRetry;

    constructor(buildApi: IBuildApi, debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

        this.buildApi = buildApi;
        this.buildApiRetry = new BuildApiRetry(this.buildApi);

    }

    public async findBuild(projectName: string, definitionId: number, tags?: string[]): Promise<Build> {

        const debug = this.debugLogger.extend(this.findBuild.name);

        const availableBuilds: Build[] = await this.buildApiRetry.getBuildsRetry(projectName, definitionId, tags);

        if (availableBuilds.length <= 0) {

            if (tags) {

                throw new Error(`No definition <${definitionId}> builds matching filter found (tags: ${tags})`);

            } else {

                throw new Error(`No definition <${definitionId}> builds found`);

            }

        }

        // Get last available build
        const targetBuild: Build = availableBuilds[0];

        debug(targetBuild);

        return targetBuild;

    }

}
