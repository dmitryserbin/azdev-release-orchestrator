import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IDebug } from "../../loggers/idebug";
import { ICoreHelper } from "./icorehelper";
import { ICoreApiRetry } from "../../extensions/coreapiretry/icoreapiretry";
import { ILogger } from "../../loggers/ilogger";

export class CoreHelper implements ICoreHelper {

    private debugLogger: IDebug;

    private coreApi: ICoreApiRetry;

    constructor(coreApi: ICoreApiRetry, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.coreApi = coreApi;

    }

    public async getProject(projectId: string): Promise<TeamProject> {

        const debug = this.debugLogger.extend(this.getProject.name);

        const targetProject: TeamProject = await this.coreApi.getProject(projectId);

        if (!targetProject) {

            throw new Error(`Project <${projectId}> not found`);

        }

        debug(targetProject);

        return targetProject;

    }

}
