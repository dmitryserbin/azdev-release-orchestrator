import { IStageProgress } from "./stageprogress";
import { ReleaseStatus } from "./releasestatus";

export interface IReleaseProgress {

    name: string;
    url: string;
    stages: IStageProgress[];
    status: ReleaseStatus;

}
