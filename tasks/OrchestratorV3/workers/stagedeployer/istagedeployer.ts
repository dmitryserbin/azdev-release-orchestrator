import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces"

import { ISettings } from "../../helpers/taskhelper/isettings"
import { IBuildStage } from "../progressmonitor/ibuildstage"

export interface IStageDeployer {
	deployManual(stage: IBuildStage, build: Build, settings: ISettings): Promise<IBuildStage>
	deployAutomated(stage: IBuildStage, build: Build, settings: ISettings): Promise<IBuildStage>
}
