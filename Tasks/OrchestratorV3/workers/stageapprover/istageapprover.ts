import { IBuildStage } from "../progressmonitor/ibuildstage";

export interface IStageApprover {

    approve(stage: IBuildStage): Promise<IBuildStage>;
    isApprovalPeding(stage: IBuildStage): boolean;
    isCheckPeding(stage: IBuildStage): boolean;

}
