import { ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseProgress } from "../common/releaseprogress";
import { IStageProgress } from "../common/stageprogress";
import { IReleaseJob } from "../common/releasejob";

export interface IMonitor {

    createProgress(releaseJob: IReleaseJob): IReleaseProgress;
    updateReleaseProgress(releaseProgress: IReleaseProgress): void;
    updateStageProgress(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment): void;
    getActiveStages(releaseProgress: IReleaseProgress): IStageProgress[];
    getPendingStages(releaseProgress: IReleaseProgress): IStageProgress[];
    isStageCompleted(stageProgress: IStageProgress): boolean;
    isStageActive(stageProgress: IStageProgress): boolean;
    isStagePending(stageProgress: IStageProgress): boolean;

}
