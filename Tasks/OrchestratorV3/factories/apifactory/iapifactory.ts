import { ICoreApiRetry } from "../../extensions/coreapiretry/icoreapiretry";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";

export interface IApiFactory {

    createCoreApi(): Promise<ICoreApiRetry>;
    createBuildApi(): Promise<IBuildApiRetry>;
    createRunApi(): Promise<IRunApiRetry>;

}
