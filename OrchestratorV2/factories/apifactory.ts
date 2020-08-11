import Debug from "debug";

import { CoreApi } from "azure-devops-node-api/CoreApi";
import { ReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { BuildApi } from "azure-devops-node-api/BuildApi";
import { WebApi, getPersonalAccessTokenHandler } from "azure-devops-node-api";
import { IRequestOptions, IRequestHandler } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";

import { IApiFactory } from "../interfaces/factories/apifactory";
import { IDebugLogger } from "../interfaces/common/debuglogger";

export class ApiFactory implements IApiFactory {

    private webApi: WebApi;
    private debugLogger: Debug.Debugger;

    constructor(accountName: string, token: string, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        const auth: IRequestHandler = getPersonalAccessTokenHandler(token);

        // Use integrated retry mechanism to address
        // Intermittent Azure DevOps connectivity errors
        const options = {

            allowRetries: true,
            maxRetries: 100,
            socketTimeout: 30000,

        } as IRequestOptions;

        this.webApi = new WebApi(`https://dev.azure.com/${accountName}`, auth, options);

    }

    public async createCoreApi(): Promise<CoreApi> {

        const debug = this.debugLogger.extend(this.createCoreApi.name);

        const coreApi: CoreApi = await this.webApi.getCoreApi();

        debug(`Azure DevOps Core API initialized`);

        return coreApi;

    }

    public async createReleaseApi(): Promise<ReleaseApi> {

        const debug = this.debugLogger.extend(this.createReleaseApi.name);

        const releaseApi: ReleaseApi = await this.webApi.getReleaseApi();

        debug(`Azure DevOps Release API initialized`);

        return releaseApi;

    }

    public async createBuildApi(): Promise<BuildApi> {

        const debug = this.debugLogger.extend(this.createBuildApi.name);

        const buildApi: BuildApi = await this.webApi.getBuildApi();

        debug(`Azure DevOps Build API initialized`);

        return buildApi;

    }

}
