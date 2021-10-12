import { IBuildJob } from "./ibuildjob";
import { StageResult } from "./stageresult";
import { StageState } from "./stagestate";

export interface IBuildStage {

    id: string,
    name: string,
    refName:string,
    startTime: string,
    finishTime: string,
    state: StageState,
    result: StageResult,
    stateData: {
        pendingDependencies: boolean,
        pendingChecks: boolean,
    },
    jobs: IBuildJob[],

}
