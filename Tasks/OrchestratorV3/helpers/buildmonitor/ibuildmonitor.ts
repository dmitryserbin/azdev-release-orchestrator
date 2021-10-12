import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";

export interface IBuildMonitor {

    getBuildStatus(build: Build): Promise<unknown>;
    getStageStatus(build: Build, name: string): Promise<IBuildStage>

}
