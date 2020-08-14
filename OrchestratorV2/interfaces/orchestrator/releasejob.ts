import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ReleaseDefinition, Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { ISettings } from "./settings";

export interface IReleaseJob {

    project: TeamProject;
    definition: ReleaseDefinition
    release: Release;
    stages: string[];
    settings: ISettings;

}
