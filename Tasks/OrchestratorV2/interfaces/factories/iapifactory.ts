import { ICoreApiRetry } from "../extensions/icoreapiretry"
import { IReleaseApiRetry } from "../extensions/ireleaseapiretry"
import { IBuildApiRetry } from "../extensions/ibuildapiretry"

export interface IApiFactory {
	createCoreApi(): Promise<ICoreApiRetry>
	createReleaseApi(): Promise<IReleaseApiRetry>
	createBuildApi(): Promise<IBuildApiRetry>
}
