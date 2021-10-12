import { StageResult } from "./stageresult";
import { StageState } from "./stagestate";

export interface IBuildStage {

    id: string,
    name: string,
    startTime: string,
    finishTime: string,
    state: StageState,
    result: StageResult,

}
