export interface IFilters {

    buildNumber: string;
    sourceBranch: string;
    pipelineResources: {
        [key: string]: string,
    },
    repositoryResources: {
        [key: string]: string,
    },
    stageStatuses: string[];

}
