import { ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IStageProgress } from "../common/istageprogress";
import { IDetails } from "../task/idetails";
import { ISettings } from "../common/isettings";

export interface IApprover {

    approveStage(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment, projectName: string, details: IDetails, settings: ISettings): Promise<void>;
    isStageApproved(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment): Promise<boolean>;

}
