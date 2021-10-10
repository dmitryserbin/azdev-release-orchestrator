import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { IRepositoryFilter } from "../../workers/filtercreator/irepositoryfilter";

export interface IRunApiRetry {

    queueRun(definition: BuildDefinition, request: unknown): Promise<unknown>;
    getRunDetails(build: Build): Promise<unknown>;
    getRunParameters(definition: BuildDefinition, repository?: IRepositoryFilter, parameters?: IBuildParameters): Promise<unknown>;

}
