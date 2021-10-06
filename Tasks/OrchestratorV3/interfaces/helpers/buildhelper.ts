import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildParameters } from "../common/buildparameters";
import { IDetails } from "../task/details";

export interface IBuildHelper {

    getDefinition(projectName: string, definitionName: string): Promise<BuildDefinition>;
    createBuild(projectName: string, definition: BuildDefinition, details: IDetails, stages?: string[], parameters?: IBuildParameters): Promise<Build>;

}
