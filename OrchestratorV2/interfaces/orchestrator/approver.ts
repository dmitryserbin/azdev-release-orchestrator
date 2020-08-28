import { ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IStageProgress } from "../common/stageprogress";
import { IDetails } from "../task/details";
import { ISettings } from "../common/settings";

export interface IApprover {

    approveStage(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment, projectName: string, details: IDetails, settings: ISettings): Promise<void>;
    isStageApproved(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment): Promise<boolean>;

}
