import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildApproval } from "../../workers/progressmonitor/ibuildapproval";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";

export interface IBuildMonitor {

    getStageStatus(build: Build, stage: IBuildStage): Promise<IBuildStage>;
    approveStage(build: Build, approval: IBuildApproval, comment?: string): Promise<unknown>;

}
