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
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";
import { RunApiRetry } from "../../extensions/runapiretry/runapiretry";

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

        debug(`Initializing Azure DevOps Core API`);

        const coreApi: CoreApi = await this.webApi.getCoreApi();
        const coreApiRetry: ICoreApiRetry = new CoreApiRetry(coreApi);

        return coreApiRetry;

    }

    public async createBuildApi(): Promise<IBuildApiRetry> {

        const debug = this.debugLogger.extend(this.createBuildApi.name);

        debug(`Initializing Azure DevOps Build API`);

        const buildApi: BuildApi = await this.webApi.getBuildApi();
        const buildApiRetry: IBuildApiRetry = new BuildApiRetry(buildApi);

        return buildApiRetry;

    }

    public async createRunApi(): Promise<IRunApiRetry> {

        const debug = this.debugLogger.extend(this.createRunApi.name);

        debug(`Initializing Azure DevOps Run API`);

        const apiClient: IApiClient = await this.createApiClient();
        const runApi: IRunApiRetry = new RunApiRetry(apiClient, this.logger);

        return runApi;

    }

    private async createApiClient(): Promise<IApiClient> {

        const debug = this.debugLogger.extend(this.createApiClient.name);

        debug(`Initializing Azure DevOps API client`);

        const apiClient: IApiClient = new ApiClient(this.webApi.vsoClient, this.logger);

        return apiClient;

    }

}
