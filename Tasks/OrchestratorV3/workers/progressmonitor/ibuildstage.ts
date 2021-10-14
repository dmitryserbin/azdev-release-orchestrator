import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildJob } from "./ibuildjob";

export interface IBuildStage {

    id: string,
    name: string,
    startTime: Date | null,
    finishTime: Date | null,
    attempt: number,
    state: TimelineRecordState,
    result: TaskResult | null,
    stateData: {
        pendingDependencies: boolean,
        pendingChecks: boolean,
    },
    jobs: IBuildJob[],

}
