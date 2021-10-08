import { ICoreApiRetry } from "../../extensions/coreapiretry/icoreapiretry";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IApiClient } from "../../common/iapiclient";

export interface IApiFactory {

    createCoreApi(): Promise<ICoreApiRetry>;
    createBuildApi(): Promise<IBuildApiRetry>;
    createApiClient(): Promise<IApiClient>;

}
