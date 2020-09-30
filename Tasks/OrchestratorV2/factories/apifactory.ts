import { CoreApi } from "azure-devops-node-api/CoreApi";
import { ReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { BuildApi } from "azure-devops-node-api/BuildApi";
import { WebApi, getPersonalAccessTokenHandler } from "azure-devops-node-api";
import { IRequestOptions, IRequestHandler } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";

import { IApiFactory } from "../interfaces/factories/apifactory";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { ICoreApiRetry } from "../interfaces/extensions/coreapiretry";
import { CoreApiRetry } from "../extensions/coreapiretry";
import { IReleaseApiRetry } from "../interfaces/extensions/releaseapiretry";
import { ReleaseApiRetry } from "../extensions/releaseapiretry";
import { IBuildApiRetry } from "../interfaces/extensions/buildapiretry";
import { BuildApiRetry } from "../extensions/buildapiretry";
import { IEndpoint } from "../interfaces/task/endpoint";

export class ApiFactory implements IApiFactory {

    private webApi: WebApi;
    private debugLogger: IDebugLogger;

    constructor(endpoint: IEndpoint, debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

        const auth: IRequestHandler = getPersonalAccessTokenHandler(endpoint.token);

        // Use integrated retry mechanism to address
        // Intermittent Azure DevOps connectivity errors
        const options = {

            allowRetries: true,
            maxRetries: 100,
            socketTimeout: 30000,

        } as IRequestOptions;

        this.debugLogger(options);

        this.webApi = new WebApi(endpoint.url, auth, options);

        this.debugLogger(`Azure DevOps Web API initialized`);

    }

    public async createCoreApi(): Promise<ICoreApiRetry> {

        const debug = this.debugLogger.extend(this.createCoreApi.name);

        const coreApi: CoreApi = await this.webApi.getCoreApi();
        const coreApiRetry: ICoreApiRetry = new CoreApiRetry(coreApi);

        debug(`Azure DevOps Core API initialized`);

        return coreApiRetry;

    }

    public async createReleaseApi(): Promise<IReleaseApiRetry> {

        const debug = this.debugLogger.extend(this.createReleaseApi.name);

        const releaseApi: ReleaseApi = await this.webApi.getReleaseApi();
        const releaseApiRetry: IReleaseApiRetry = new ReleaseApiRetry(releaseApi);

        debug(`Azure DevOps Release API initialized`);

        return releaseApiRetry;

    }

    public async createBuildApi(): Promise<IBuildApiRetry> {

        const debug = this.debugLogger.extend(this.createBuildApi.name);

        const buildApi: BuildApi = await this.webApi.getBuildApi();
        const buildApiRetry: IBuildApiRetry = new BuildApiRetry(buildApi);

        debug(`Azure DevOps Build API initialized`);

        return buildApiRetry;

    }

}
