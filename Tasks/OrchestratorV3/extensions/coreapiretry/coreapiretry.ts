import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ICoreApi } from "azure-devops-node-api/CoreApi";

import { ICoreApiRetry } from "./icoreapiretry";
import { Retryable } from "../../common/retry";

export class CoreApiRetry implements ICoreApiRetry {

    private coreApi: ICoreApi;

    constructor(coreApi: ICoreApi) {

        this.coreApi = coreApi;

    }

    @Retryable()
    public async getProject(projectId: string, includeCapabilities?: boolean, includeHistory?: boolean): Promise<TeamProject> {

        return await this.coreApi.getProject(
            projectId,
            includeCapabilities,
            includeHistory);

    }

}
