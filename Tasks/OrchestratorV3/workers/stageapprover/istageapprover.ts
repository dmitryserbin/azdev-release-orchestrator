import { IStageProgress } from "../../orchestrator/istageprogress";

export interface IStageApprover {

    approveStage(stageProgress: IStageProgress): Promise<void>;

}
