import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IFilters } from "../task/ifilters";
import { IArtifactFilter } from "../common/iartifactfilter";
import { IReleaseFilter } from "../common/ireleasefilter";

export interface IFiltrator {

    createArtifactFilter(project: TeamProject, definition: ReleaseDefinition, filters: IFilters): Promise<IArtifactFilter[]>;
    createReleaseFilter(definition: ReleaseDefinition, stages: string[], filters: IFilters): Promise<IReleaseFilter>;

}
