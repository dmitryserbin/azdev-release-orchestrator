import { Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseProgress } from "./releaseprogress";
import { IStageProgress } from "./stageprogress";

export interface IMonitor {

    createProgress(release: Release, stages: string[]): IReleaseProgress;
    getActiveStages(releaseProgress: IReleaseProgress): IStageProgress[];
    isStageCompleted(stageProgress: IStageProgress): boolean;
    updateStatus(releaseProgress: IReleaseProgress): void;

}
