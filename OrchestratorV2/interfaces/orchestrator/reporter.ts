import { ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseProgress } from "../common/releaseprogress";
import { IStageProgress } from "../common/stageprogress";

export interface IReporter {

    displayReleaseProgress(releaseProgress: IReleaseProgress): Promise<void>;
    displayStageProgress(stageProgress: IStageProgress[]): Promise<void>;
    displayPhaseProgress(stage: ReleaseEnvironment): Promise<void>;

}
