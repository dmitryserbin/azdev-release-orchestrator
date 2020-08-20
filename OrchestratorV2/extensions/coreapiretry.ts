import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ICoreApi } from "azure-devops-node-api/CoreApi";

import { ICoreApiRetry } from "../interfaces/extensions/coreapiretry";
import { Retryable } from "../common/retry";

export class CoreApiRetry implements ICoreApiRetry {

    private coreApi: ICoreApi;

    constructor(coreApi: ICoreApi) {

        this.coreApi = coreApi;

    }

    @Retryable()
    public async getProjectRetry(projectId: string): Promise<TeamProject> {

        return await this.coreApi.getProject(projectId);

    }

}
