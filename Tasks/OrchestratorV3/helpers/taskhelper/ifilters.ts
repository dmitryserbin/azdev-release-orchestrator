export interface IFilters {

    sourceBranch: string;
    resourcePipelines: {
        [key: string]: string;
    },
    releaseTags: string[];
    artifactTags: string[];
    artifactVersion: string;
    stageStatuses: string[];

}
