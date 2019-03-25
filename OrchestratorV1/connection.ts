import Debug from "debug";

import * as az from "azure-devops-node-api";
import * as ba from "azure-devops-node-api/BuildApi";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";

import { IConnection, IEndpoint } from "./interfaces";

const logger = Debug("release-orchestrator:Connection");

export class Connection implements IConnection {

    private webApi: az.WebApi;

    constructor(endpoint: IEndpoint) {

        const auth = az.getPersonalAccessTokenHandler(endpoint.token);

        this.webApi = new az.WebApi(endpoint.url, auth);

        logger(`Azure DevOps Web API initialized`);

    }

    public async getCoreApi(): Promise<ca.CoreApi> {

        const coreApi: ca.CoreApi = await this.webApi.getCoreApi();

        logger(`Azure DevOps Core API initialized`);

        return coreApi;

    }

    public async getReleaseApi(): Promise<ra.ReleaseApi> {

        const releaseApi: ra.ReleaseApi = await this.webApi.getReleaseApi();

        logger(`Azure DevOps Release API initialized`);

        return releaseApi;

    }

    public async getBuildApi(): Promise<ba.BuildApi> {

        const buildApi: ba.BuildApi = await this.webApi.getBuildApi();

        logger(`Azure DevOps Build API initialized`);

        return buildApi;

    }

}
