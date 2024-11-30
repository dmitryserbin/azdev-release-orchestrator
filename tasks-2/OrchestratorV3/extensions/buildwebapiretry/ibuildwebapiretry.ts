import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"

import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters"
import { IRepositoryFilter } from "../../workers/filtercreator/irepositoryfilter"
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage"

export interface IBuildWebApiRetry {
	getRunDetails(build: Build): Promise<unknown>
	getRunParameters(definition: BuildDefinition, repository?: IRepositoryFilter, parameters?: IBuildParameters): Promise<unknown>
	getRunStageChecks(build: Build, stage: IBuildStage): Promise<unknown>
}
