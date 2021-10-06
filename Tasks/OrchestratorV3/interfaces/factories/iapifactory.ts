import { ICoreApiRetry } from "../extensions/icoreapiretry";
import { IBuildApiRetry } from "../extensions/ibuildapiretry";

export interface IApiFactory {

    createCoreApi(): Promise<ICoreApiRetry>;
    createBuildApi(): Promise<IBuildApiRetry>;

}
