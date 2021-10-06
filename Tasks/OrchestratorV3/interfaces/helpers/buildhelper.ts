import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { IBuildFilter } from "../common/buildfilter";

import { IBuildParameters } from "../common/buildparameters";

export interface IBuildHelper {

    getDefinition(projectName: string, definitionName: string): Promise<BuildDefinition>;
    createBuild(projectName: string, definition: BuildDefinition, parameters?: IBuildParameters): Promise<Build>;
    findBuilds(projectName: string, definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build[]>;
    getLatestBuild(projectName: string, definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build>;

}
