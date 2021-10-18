import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ISettings } from "../../helpers/taskhelper/isettings";
import { IBuildStage } from "../progressmonitor/ibuildstage";

export interface IStageApprover {

    approve(stage: IBuildStage, build: Build, comment?: string): Promise<IBuildStage>;
    check(stage: IBuildStage): Promise<IBuildStage>;
    validateApproval(stage: IBuildStage, build: Build, settings: ISettings): Promise<void>;
    validateCheck(stage: IBuildStage, build: Build, settings: ISettings): Promise<void>;
    isApprovalPeding(stage: IBuildStage): boolean;
    isCheckPeding(stage: IBuildStage): boolean;

}
