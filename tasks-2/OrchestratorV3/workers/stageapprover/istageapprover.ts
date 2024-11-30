import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces"

import { ISettings } from "../../helpers/taskhelper/isettings"
import { IBuildStage } from "../progressmonitor/ibuildstage"

export interface IStageApprover {
	approve(stage: IBuildStage, build: Build, settings: ISettings, comment?: string): Promise<IBuildStage>
	check(stage: IBuildStage, build: Build, settings: ISettings): Promise<IBuildStage>
	isApprovalPending(stage: IBuildStage): boolean
	isCheckPending(stage: IBuildStage): boolean
}
