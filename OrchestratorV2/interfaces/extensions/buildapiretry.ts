import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildApiRetry extends Partial<IBuildApi> {

    getBuildsRetry(projectName: string, definitionId: number, tags?: string[]): Promise<Build[]>;

}
