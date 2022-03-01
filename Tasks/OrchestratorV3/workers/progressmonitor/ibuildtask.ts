import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildTask {

    id: string,
    name: string,
    startTime: Date | null,
    finishTime: Date | null,
    state: TimelineRecordState | null,
    result: TaskResult,

}
