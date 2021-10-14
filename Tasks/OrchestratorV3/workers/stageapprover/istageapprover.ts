import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IStageProgress } from "../../orchestrator/istageprogress";
import { IBuildStage } from "../progressmonitor/ibuildstage";

export interface IStageApprover {

    approve(stageProgress: IStageProgress): Promise<IStageProgress>;
    isPeding(build: Build, stage: IBuildStage): Promise<boolean>;

}
