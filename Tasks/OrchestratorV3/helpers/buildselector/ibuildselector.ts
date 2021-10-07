import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { IBuildFilter } from "../../workers/filtercreator/ibuildfilter";

import { IBuildParameters } from "../taskhelper/ibuildparameters";

export interface IBuildSelector {

    createBuild(projectName: string, definition: BuildDefinition, stages?: string[], parameters?: IBuildParameters): Promise<Build>;
    getLatestBuild(projectName: string, definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build>;
    getSpecificBuild(projectName: string, definition: BuildDefinition, buildNumber: string): Promise<Build>;

}
