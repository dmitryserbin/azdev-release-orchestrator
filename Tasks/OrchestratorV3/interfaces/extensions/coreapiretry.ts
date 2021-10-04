import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

export interface ICoreApiRetry extends Partial<ICoreApi> {

    getProject(projectId: string, includeCapabilities?: boolean, includeHistory?: boolean): Promise<TeamProject>;

}
