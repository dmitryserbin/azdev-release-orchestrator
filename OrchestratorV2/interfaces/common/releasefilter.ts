import { IStageStatusFilter } from "./stagestatusfilter";

export interface IReleaseFilter {

    artifactVersion?: string;
    sourceBranch?: string;
    tag?: string[];
    stageStatus?: IStageStatusFilter,

}
