import { IStageProgress } from "./stageprogress";

export interface IReleaseProgress {

    name: string;
    url: string;
    progress: IStageProgress[];

}
