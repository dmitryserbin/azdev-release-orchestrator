import { IStageProgress } from "./istageprogress";
import { RunStatus } from "./runstatus";

export interface IRunProgress {

    id: number;
    name: string;
    project: string,
    url: string;
    stages: IStageProgress[];
    status: RunStatus;

}
