import { BuildApi } from "azure-devops-node-api/BuildApi";
import { ReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { CoreApi } from "azure-devops-node-api/CoreApi";

export interface IApiFactory {

    createCoreApi(): Promise<CoreApi>;
    createReleaseApi(): Promise<ReleaseApi>;
    createBuildApi(): Promise<BuildApi>;

}
