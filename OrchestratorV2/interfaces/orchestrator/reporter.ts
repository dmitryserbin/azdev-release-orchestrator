import { IReleaseProgress } from "../common/releaseprogress";
import { IStageProgress } from "../common/stageprogress";
import { IFilters } from "../task/filters";

export interface IReporter {

    getReleaseProgress(releaseProgress: IReleaseProgress): string;
    getStagesProgress(stagesProgress: IStageProgress[]): string;
    getStageProgress(stageProgress: IStageProgress): string;
    getFilter(releaseFilter: IFilters): string;

}
