import { ICoreApiRetry } from "../extensions/coreapiretry";
import { IReleaseApiRetry } from "../extensions/releaseapiretry";
import { IBuildApiRetry } from "../extensions/buildapiretry";

export interface IApiFactory {

    createCoreApi(): Promise<ICoreApiRetry>;
    createReleaseApi(): Promise<IReleaseApiRetry>;
    createBuildApi(): Promise<IBuildApiRetry>;

}
