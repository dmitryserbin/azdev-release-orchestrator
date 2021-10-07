import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { IBuildFilter } from "../common/ibuildfilter";

import { IBuildParameters } from "../common/ibuildparameters";

export interface IBuildHelper {

    getDefinition(projectName: string, definitionName: string): Promise<BuildDefinition>;
    createBuild(projectName: string, definition: BuildDefinition, stages?: string[], parameters?: IBuildParameters): Promise<Build>;
    findBuilds(projectName: string, definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build[]>;
    getBuild(projectName: string, definition: BuildDefinition, buildNumber: string): Promise<Build>;
    getLatestBuild(projectName: string, definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build>;

}
