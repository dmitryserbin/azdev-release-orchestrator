import { IReleaseProgress } from "../common/releaseprogress";
import { IStageProgress } from "../common/stageprogress";
import { IFilters } from "../task/filters";
import { IReleaseVariable } from "../common/releasevariable";

export interface IReporter {

    getReleaseProgress(releaseProgress: IReleaseProgress): string;
    getStagesProgress(stagesProgress: IStageProgress[]): string;
    getStageProgress(stageProgress: IStageProgress): string;
    getFilters(releaseFilter: IFilters): string;
    getVariables(variables: IReleaseVariable[]): string;

}