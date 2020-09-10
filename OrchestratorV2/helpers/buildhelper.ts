import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IBuildApiRetry } from "../interfaces/extensions/buildapiretry";

export class BuildHelper implements IBuildHelper {

    private debugLogger: IDebugLogger;

    private buildApi: IBuildApiRetry;

    constructor(buildApi: IBuildApiRetry, debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

        this.buildApi = buildApi;

    }

    public async findBuild(projectName: string, definitionId: number, top: number, tags?: string[]): Promise<Build> {

        const debug = this.debugLogger.extend(this.findBuild.name);

        const availableBuilds: Build[] = await this.buildApi.getBuilds(
            projectName,
            [ definitionId ],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            tags,
            undefined,
            top);

        if (availableBuilds.length <= 0) {

            if (tags) {

                throw new Error(`No definition <${definitionId}> builds matching filter found (tags: ${tags ?? "-"})`);

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
