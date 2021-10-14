import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IStageProgress } from "../../orchestrator/istageprogress";
import { IBuildStage } from "../progressmonitor/ibuildstage";

export interface IStageApprover {

    isStageApproved(build: Build, stageProgress: IStageProgress, stageStatus: IBuildStage): Promise<boolean>;
    approveStage(stageProgress: IStageProgress): Promise<void>;

}
