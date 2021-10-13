import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildTask {

    id: string,
    name: string,
    startTime: Date | undefined,
    finishTime: Date | undefined,
    state: TimelineRecordState,
    result: TaskResult,

}
