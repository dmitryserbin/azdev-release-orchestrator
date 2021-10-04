import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

export interface ICoreHelper {

    getProject(projectId: string): Promise<TeamProject>;

}
