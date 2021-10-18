import { ICoreApiRetry } from "../../extensions/coreapiretry/icoreapiretry";
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry";
import { IBuildWebApiRetry } from "../../extensions/buildwebapiretry/ibuildwebapiretry";
import { IPipelinesApiRetry } from "../../extensions/pipelinesapiretry/ipipelineapiretry";

export interface IApiFactory {

    createCoreApi(): Promise<ICoreApiRetry>;
    createBuildApi(): Promise<IBuildApiRetry>;
    createPipelinesApi(): Promise<IPipelinesApiRetry>;
    createBuildWebApi(): Promise<IBuildWebApiRetry>;

}
