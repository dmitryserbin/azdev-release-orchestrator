import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildHelper {

    findBuild(projectName: string, definitionName: string, definitionId: number, buildNumber: string, tags: string[], top: number): Promise<Build>;

}
