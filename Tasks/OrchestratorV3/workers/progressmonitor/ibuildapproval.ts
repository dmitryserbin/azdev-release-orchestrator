import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildApproval {

    id: string,
    state: TimelineRecordState,
    result: TaskResult | null,

}
