import * as az from "azure-devops-node-api";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";

import { IConnection, IEndpoint } from "./interfaces";

export class Connection implements IConnection {

    private webApi: az.WebApi;

    constructor (endpoint: IEndpoint) {

        const auth = az.getPersonalAccessTokenHandler(endpoint.token);
        
        this.webApi = new az.WebApi(endpoint.url, auth);

    }

    async getCoreApi(): Promise<ca.CoreApi> {

        const coreApi: ca.CoreApi = await this.webApi.getCoreApi();

        return coreApi;

    }

    async getReleaseApi(): Promise<ra.ReleaseApi> {

        const releaseApi: ra.ReleaseApi = await this.webApi.getReleaseApi();

        return releaseApi;

    }

}
