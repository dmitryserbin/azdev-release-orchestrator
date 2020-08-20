import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildApiRetry } from "../interfaces/extensions/buildapiretry";
import { Retryable } from "../common/retry";

export class BuildApiRetry implements IBuildApiRetry {

    private buildApi: IBuildApi;

    constructor(buildApi: IBuildApi) {

        this.buildApi = buildApi;

    }

    @Retryable()
    public async getBuildsRetry(projectName: string, definitionId: number, tags?: string[]): Promise<Build[]> {

        return await this.buildApi.getBuilds(
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
            tags);

    }

}
