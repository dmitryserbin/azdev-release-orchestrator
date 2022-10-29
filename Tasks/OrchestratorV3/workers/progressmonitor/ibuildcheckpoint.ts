import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildCheckpoint {

    id: string;
    state: TimelineRecordState;
    result: TaskResult | null;

}
