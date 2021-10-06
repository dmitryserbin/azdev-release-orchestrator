import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ISettings } from "./settings";
import { DeploymentType } from "./deploymenttype";

export interface IReleaseJob {

    project: TeamProject;
    definition: BuildDefinition
    build: Build;
    stages: string[];
    type: DeploymentType,
    settings: ISettings;

}
