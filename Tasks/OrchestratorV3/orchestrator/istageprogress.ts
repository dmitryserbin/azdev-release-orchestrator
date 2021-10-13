import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildJob } from "../workers/progressmonitor/ibuildjob";

export interface IStageProgress {

    id: string,
    name: string,
    startTime: Date | null,
    finishTime: Date | null,
    attempt: number,
    state: TimelineRecordState,
    result: TaskResult | null,
    approval: string,
    jobs: IBuildJob[],

}
