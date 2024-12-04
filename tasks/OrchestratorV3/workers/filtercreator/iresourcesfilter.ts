import { IPipelineFilter } from "./ipipelinefilter"
import { IRepositoryFilter } from "./irepositoryfilter"

export interface IResourcesFilter {
	repositories: {
		[key: string]: IRepositoryFilter
	}
	pipelines: {
		[key: string]: IPipelineFilter
	}
}
