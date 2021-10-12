import { StageResult } from "../workers/progressmonitor/stageresult";
import { StageState } from "../workers/progressmonitor/stagestate";
import { IStageApproval } from "../workers/stageapprover/istageapproval";

export interface IStageProgress {

    id: string;
    name: string;
    approval: IStageApproval;
    state: StageState;
    result: StageResult;
    duration?: string;

}
