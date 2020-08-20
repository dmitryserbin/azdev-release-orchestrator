import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { ICoreApiRetry } from "../interfaces/extensions/coreapiretry";
import { CoreApiRetry } from "../extensions/coreapiretry";

export class CoreHelper implements ICoreHelper {

    private debugLogger: IDebugLogger;

    private coreApi: ICoreApi;
    private coreApiRetry: ICoreApiRetry;

    constructor(coreApi: ICoreApi, debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

        this.coreApi = coreApi;
        this.coreApiRetry = new CoreApiRetry(this.coreApi);

    }

    public async getProject(projectId: string): Promise<TeamProject> {

        const debug = this.debugLogger.extend(this.getProject.name);

        const targetProject: TeamProject = await this.coreApiRetry.getProjectRetry(projectId);

        if (!targetProject) {

            throw new Error(`Project <${projectId}> not found`);

        }

        debug(targetProject);

        return targetProject;

    }

}
