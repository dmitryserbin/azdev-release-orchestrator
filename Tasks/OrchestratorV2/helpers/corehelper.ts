import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IDebugCreator } from "../interfaces/loggers/idebugcreator";
import { IDebugLogger } from "../interfaces/loggers/idebuglogger";
import { ICoreHelper } from "../interfaces/helpers/icorehelper";
import { ICoreApiRetry } from "../interfaces/extensions/icoreapiretry";

export class CoreHelper implements ICoreHelper {

    private debugLogger: IDebugLogger;

    private coreApi: ICoreApiRetry;

    constructor(coreApi: ICoreApiRetry, debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

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
