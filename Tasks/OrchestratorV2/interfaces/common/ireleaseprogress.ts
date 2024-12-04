import { IStageProgress } from "./istageprogress"
import { ReleaseStatus } from "./ireleasestatus"

export interface IReleaseProgress {
	id: number
	name: string
	project: string
	url: string
	stages: IStageProgress[]
	status: ReleaseStatus
}
