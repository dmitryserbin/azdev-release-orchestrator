import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Release, ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { ISettings } from "./isettings";
import { DeploymentType } from "./ideploymenttype";

export interface IReleaseJob {

    project: TeamProject;
    definition: ReleaseDefinition;
    release: Release;
    stages: string[];
    type: DeploymentType;
    settings: ISettings;

}
