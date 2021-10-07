import { ICoreApiRetry } from "../../extensions/coreapiretry/icoreapiretry";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";

export interface IApiFactory {

    createCoreApi(): Promise<ICoreApiRetry>;
    createBuildApi(): Promise<IBuildApiRetry>;

}
