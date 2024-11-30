import { Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces"

import { IReleaseProgress } from "../common/ireleaseprogress"
import { IStageProgress } from "../common/istageprogress"
import { IFilters } from "../task/ifilters"
import { IReleaseVariable } from "../common/ireleasevariable"

export interface IReporter {
	getReleaseProgress(releaseProgress: IReleaseProgress): string
	getStagesProgress(stagesProgress: IStageProgress[]): string
	getStageProgress(stageProgress: IStageProgress): string
	getRelease(release: Release, targetStages: string[]): string
	getFilters(releaseFilter: IFilters): string
	getVariables(variables: IReleaseVariable[]): string
}
