import Debug from "debug";

import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { ICoreHelper } from "../interfaces/helpers/corehelper";

export class CoreHelper implements ICoreHelper {

    private debugLogger: Debug.Debugger;

    private coreApi: ICoreApi;

    constructor(coreApi: ICoreApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

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
