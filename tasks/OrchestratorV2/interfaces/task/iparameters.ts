import { IFilters } from "./ifilters"
import { IReleaseVariable } from "../common/ireleasevariable"
import { ReleaseType } from "../common/ireleasetype"
import { ISettings } from "../common/isettings"

export interface IParameters {
	releaseType: ReleaseType
	projectName: string
	definitionName: string
	releaseName: string
	stages: string[]
	variables: IReleaseVariable[]
	filters: IFilters
	settings: ISettings
}
