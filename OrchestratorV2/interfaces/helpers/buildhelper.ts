import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildHelper {

    findBuild(projectName: string, definitionId: number, tags?: string[]): Promise<Build>;

}
