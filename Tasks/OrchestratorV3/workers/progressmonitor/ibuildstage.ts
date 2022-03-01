import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildApproval } from "./ibuildapproval";
import { IBuildCheck } from "./ibuildcheck";
import { IBuildCheckpoint } from "./ibuildcheckpoint";
import { IBuildJob } from "./ibuildjob";

export interface IBuildStage {

    id: string,
    name: string,
    startTime: Date | null,
    finishTime: Date | null,
    state: TimelineRecordState,
    result: TaskResult | null,
    checkpoint: IBuildCheckpoint | null;
    approvals: IBuildApproval[],
    checks: IBuildCheck[],
    jobs: IBuildJob[],
    attempt: {
        stage: number,
        approval: number,
        check: number,
    },

}
