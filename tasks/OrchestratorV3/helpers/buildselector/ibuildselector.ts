import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"

import { IBuildFilter } from "../../workers/filtercreator/ibuildfilter"
import { IResourcesFilter } from "../../workers/filtercreator/iresourcesfilter"
import { IBuildParameters } from "../taskhelper/ibuildparameters"
import { IRunStage } from "../../workers/runcreator/irunstage"

export interface IBuildSelector {
	createBuild(definition: BuildDefinition, resourcesFilter: IResourcesFilter, stages?: string[], parameters?: IBuildParameters): Promise<Build>
	getLatestBuild(definition: BuildDefinition, filter: IBuildFilter, top: number): Promise<Build>
	getSpecificBuild(definition: BuildDefinition, buildNumber: string): Promise<Build>
	getBuildStages(build: Build, stages: string[]): Promise<IRunStage[]>
	cancelBuild(build: Build): Promise<Build>
}
