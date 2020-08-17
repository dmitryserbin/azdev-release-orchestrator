import { ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseProgress } from "../common/releaseprogress";

export interface IReporter {

    validateRelease(releaseProgress: IReleaseProgress): Promise<void>;
    displayReleaseProgress(releaseProgress: IReleaseProgress): Promise<void>;
    displayStageProgress(stage: ReleaseEnvironment): Promise<void>;

}
