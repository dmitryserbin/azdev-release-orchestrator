import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

export interface ICoreApiRetry extends Partial<ICoreApi> {

    getProjectRetry(projectId: string): Promise<TeamProject>;

}
