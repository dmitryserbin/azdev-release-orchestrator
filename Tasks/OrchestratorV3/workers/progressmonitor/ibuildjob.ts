import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildTask } from "./ibuildtask";

export interface IBuildJob {

    id: string,
    name: string,
    workerName: string,
    startTime: Date | undefined,
    finishTime: Date | undefined,
    state: TimelineRecordState,
    result: TaskResult | undefined,
    tasks: IBuildTask[],

}