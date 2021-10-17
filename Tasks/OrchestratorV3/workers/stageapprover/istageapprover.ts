import { IStageProgress } from "../../orchestrator/istageprogress";
import { IBuildStage } from "../progressmonitor/ibuildstage";

export interface IStageApprover {

    approve(stageProgress: IStageProgress): Promise<IStageProgress>;
    isApprovalPeding(stage: IBuildStage): boolean;
    isCheckPeding(stage: IBuildStage): boolean;

}
