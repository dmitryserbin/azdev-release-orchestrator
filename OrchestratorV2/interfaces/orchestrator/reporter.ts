import { ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseProgress } from "../common/releaseprogress";

export interface IReporter {

    displayReleaseProgress(releaseProgress: IReleaseProgress): Promise<void>;
    displayStageProgress(stage: ReleaseEnvironment): Promise<void>;

}
