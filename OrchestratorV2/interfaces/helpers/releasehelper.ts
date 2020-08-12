import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IReleaseHelper {

    getDefinition(projectName: string, definitionId: number): Promise<ReleaseDefinition>;

}
