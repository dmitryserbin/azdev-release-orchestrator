import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildJob } from "./ibuildjob";

export interface IBuildStage {

    id: string,
    name: string,
    startTime: Date,
    finishTime: Date,
    attempt: number,
    state: TimelineRecordState,
    result: TaskResult | undefined,
    jobs: IBuildJob[],

}
