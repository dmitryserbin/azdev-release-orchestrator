import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IStageProgress } from "../../orchestrator/istageprogress";
import { IBuildStage } from "../progressmonitor/ibuildstage";

export interface IStageApprover {

    approve(stageProgress: IStageProgress): Promise<IStageProgress>;
    getChecks(build: Build, stage: IBuildStage): Promise<unknown>;
    isApprovalPeding(stageChecks: any): boolean;
    isCheckPeding(stageChecks: any): boolean;

}
