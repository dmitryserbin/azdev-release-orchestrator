import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

export interface IProjectSelector {

    getProject(projectId: string): Promise<TeamProject>;

}
