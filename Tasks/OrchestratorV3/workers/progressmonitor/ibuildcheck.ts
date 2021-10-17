import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildCheck {

    id: string,
    state: TimelineRecordState,
    result: TaskResult | null,

}
