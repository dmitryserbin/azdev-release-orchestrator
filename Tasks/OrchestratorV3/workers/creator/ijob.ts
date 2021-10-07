import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ISettings } from "../../helpers/taskhelper/isettings";
import { JobType } from "./jobtype";

export interface IJob {

    project: TeamProject;
    definition: BuildDefinition
    build: Build;
    stages: string[];
    type: JobType,
    settings: ISettings;

}
