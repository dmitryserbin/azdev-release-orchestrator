import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildStage } from "../progressmonitor/ibuildstage";

export interface IStageApprover {

    approve(build: Build, stage: IBuildStage, comment?: string): Promise<IBuildStage>;
    isApprovalPeding(stage: IBuildStage): boolean;
    isCheckPeding(stage: IBuildStage): boolean;

}
