import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ISettings } from "./isettings";
import { DeploymentType } from "./ideploymenttype";

export interface IReleaseJob {

    project: TeamProject;
    definition: BuildDefinition
    build: Build;
    stages: string[];
    type: DeploymentType,
    settings: ISettings;

}
