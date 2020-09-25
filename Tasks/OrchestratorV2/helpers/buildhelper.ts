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

    public async findBuild(projectName: string, definitionName: string, definitionId: number, buildNumber: string, tags: string[], top: number): Promise<Build> {

        const debug = this.debugLogger.extend(this.findBuild.name);

        const builds: Build[] = await this.buildApi.getBuilds(
            projectName,
            [ definitionId ],
            undefined,
            buildNumber,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            tags,
            undefined,
            top);

        if (!builds.length) {

            throw new Error(`No definition <${definitionName}> (${definitionId}) builds matching filter found`);

        }

        // Filter last available build
        const targetBuild: Build = builds[0];

        debug(targetBuild);

        return targetBuild;

    }

}
