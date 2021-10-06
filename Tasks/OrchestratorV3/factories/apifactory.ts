import { CoreApi } from "azure-devops-node-api/CoreApi";
import { BuildApi } from "azure-devops-node-api/BuildApi";
import { WebApi, getPersonalAccessTokenHandler } from "azure-devops-node-api";
import { IRequestOptions, IRequestHandler } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";

import { IApiFactory } from "../interfaces/factories/iapifactory";
import { IDebug } from "../interfaces/loggers/idebug";
import { ICoreApiRetry } from "../interfaces/extensions/icoreapiretry";
import { CoreApiRetry } from "../extensions/coreapiretry";
import { IBuildApiRetry } from "../interfaces/extensions/ibuildapiretry";
import { BuildApiRetry } from "../extensions/buildapiretry";
import { IEndpoint } from "../interfaces/task/iendpoint";
import { ILogger } from "../interfaces/loggers/ilogger";

export class ApiFactory implements IApiFactory {

    private debugLogger: IDebug;

    private webApi: WebApi;

    constructor(endpoint: IEndpoint, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

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

    public async createBuildApi(): Promise<IBuildApiRetry> {

        const debug = this.debugLogger.extend(this.createBuildApi.name);

        const buildApi: BuildApi = await this.webApi.getBuildApi();
        const buildApiRetry: IBuildApiRetry = new BuildApiRetry(buildApi);

        debug(`Azure DevOps Build API initialized`);

        return buildApiRetry;

    }

}
