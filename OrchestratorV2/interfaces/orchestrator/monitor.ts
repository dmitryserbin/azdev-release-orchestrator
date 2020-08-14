import { Release, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseProgress } from "../common/releaseprogress";
import { IStageProgress } from "../common/stageprogress";

export interface IMonitor {

    createProgress(release: Release, stages: string[]): IReleaseProgress;
    getActiveStages(releaseProgress: IReleaseProgress): IStageProgress[];
    isStageCompleted(stageProgress: IStageProgress): boolean;
    updateStageProgress(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment): void;
    updateReleaseProgress(releaseProgress: IReleaseProgress): void;

}
