import { IStageProgress } from "./stageprogress";
import { ReleaseStatus } from "./releasestatus";

export interface IReleaseProgress {

    id: number;
    name: string;
    project: string,
    url: string;
    stages: IStageProgress[];
    status: ReleaseStatus;

}
