import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildApproval } from "../../workers/progressmonitor/ibuildapproval";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";

export interface IStageSelector {

    getStage(build: Build, stage: IBuildStage): Promise<IBuildStage>;
    startStage(build: Build, stage: IBuildStage, confirm: boolean): Promise<void>;
    approveStage(build: Build, approval: IBuildApproval, comment?: string): Promise<unknown>;
    confirmStage(stage: IBuildStage): Promise<void>;

}
