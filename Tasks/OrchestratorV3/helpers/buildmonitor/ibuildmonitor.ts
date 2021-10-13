import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";

export interface IBuildMonitor {

    getStageStatus(build: Build, name: string): Promise<IBuildStage>;

}
