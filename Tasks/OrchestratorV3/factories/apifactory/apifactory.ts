import { CoreApi } from "azure-devops-node-api/CoreApi";
import { BuildApi } from "azure-devops-node-api/BuildApi";
import { WebApi, getPersonalAccessTokenHandler } from "azure-devops-node-api";
import { IRequestOptions, IRequestHandler } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";

import { IApiFactory } from "./iapifactory";
import { IDebug } from "../../loggers/idebug";
import { ICoreApiRetry } from "../../extensions/coreapiretry/icoreapiretry";
import { CoreApiRetry } from "../../extensions/coreapiretry/coreapiretry";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { BuildApiRetry } from "../../extensions/buildapiretry/buildapiretry";
import { IEndpoint } from "../../helpers/taskhelper/iendpoint";
import { ILogger } from "../../loggers/ilogger";
import { ApiClient } from "../../common/apiclient";
import { IApiClient } from "../../common/iapiclient";

export class ApiFactory implements IApiFactory {

    private logger: ILogger;
    private debugLogger: IDebug;

    private webApi: WebApi;

    constructor(endpoint: IEndpoint, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        const requestOptions: IRequestOptions = {

            allowRetries: true,
            maxRetries: 100,
            socketTimeout: 30000,

        };

        this.debugLogger(requestOptions);

        this.debugLogger(`Initializing Azure DevOps Web API`);

        const auth: IRequestHandler = getPersonalAccessTokenHandler(endpoint.token);
        this.webApi = new WebApi(endpoint.url, auth, requestOptions);

    }

    public async createCoreApi(): Promise<ICoreApiRetry> {

        const debug = this.debugLogger.extend(this.createCoreApi.name);

        const coreApi: CoreApi = await this.webApi.getCoreApi();
        const coreApiRetry: ICoreApiRetry = new CoreApiRetry(coreApi);

        debug(`Azure DevOps Core API initialized`);

        return coreApiRetry;

    }

    public async createBuildApi(): Promise<IBuildApiRetry> {

        const debug = this.debugLogger.extend(this.createBuildApi.name);

        const buildApi: BuildApi = await this.webApi.getBuildApi();
        const buildApiRetry: IBuildApiRetry = new BuildApiRetry(buildApi);

        debug(`Azure DevOps Build API initialized`);

        return buildApiRetry;

    }

    public async createApiClient(): Promise<IApiClient> {

        const debug = this.debugLogger.extend(this.createApiClient.name);

        debug(`Azure DevOps API client initialized`);

        const apiClient: IApiClient = new ApiClient(this.webApi.vsoClient, this.logger);

        return apiClient;

    }

}
