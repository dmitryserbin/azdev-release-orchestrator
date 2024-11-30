import { IBuildStage } from "../workers/progressmonitor/ibuildstage"
import { RunStatus } from "./runstatus"

export interface IRunProgress {
	id: number
	name: string
	project: string
	url: string
	stages: IBuildStage[]
	status: RunStatus
}
