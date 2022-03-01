import { BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IDefinitionSelector {

    getDefinition(projectName: string, definitionName: string): Promise<BuildDefinition>;

}
