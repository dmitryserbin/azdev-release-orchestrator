import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildJob } from "../workers/progressmonitor/ibuildjob";

export interface IStageProgress {

    id: string,
    name: string,
    startTime: Date | undefined,
    finishTime: Date | undefined,
    attempt: number,
    state: TimelineRecordState,
    result: TaskResult | undefined,
    approval: string,
    jobs: IBuildJob[],

}
