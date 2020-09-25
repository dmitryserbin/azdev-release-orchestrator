import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IFilters } from "../task/filters";
import { IArtifactFilter } from "../common/artifactfilter";
import { IReleaseFilter } from "../common/releasefilter";

export interface IFiltrator {

    createArtifactFilter(project: TeamProject, definition: ReleaseDefinition, filters: IFilters): Promise<IArtifactFilter[]>;
    createReleaseFilter(definition: ReleaseDefinition, stages: string[], filters: IFilters): Promise<IReleaseFilter>;

}
