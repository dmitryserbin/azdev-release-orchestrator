import { ICoreApiRetry } from "../extensions/coreapiretry";
import { IBuildApiRetry } from "../extensions/buildapiretry";

export interface IApiFactory {

    createCoreApi(): Promise<ICoreApiRetry>;
    createBuildApi(): Promise<IBuildApiRetry>;

}
