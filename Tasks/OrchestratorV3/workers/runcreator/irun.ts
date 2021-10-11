import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ISettings } from "../../helpers/taskhelper/isettings";
import { IRunStage } from "./irunstage";

export interface IRun {

    project: TeamProject;
    definition: BuildDefinition
    build: Build;
    stages: IRunStage[];
    settings: ISettings;

}
