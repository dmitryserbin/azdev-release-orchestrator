import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces"

import { IBuildTask } from "./ibuildtask"

export interface IBuildJob {
	id: string
	name: string
	workerName: string
	startTime: Date | null
	finishTime: Date | null
	state: TimelineRecordState
	result: TaskResult | null
	tasks: IBuildTask[]
}
