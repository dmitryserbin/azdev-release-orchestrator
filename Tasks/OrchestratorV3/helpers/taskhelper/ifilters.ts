export interface IFilters {

    sourceBranch: string;
    pipelineResources: {
        [key: string]: string,
    },
    repositoryResources: {
        [key: string]: string,
    },
    stageStatuses: string[];

}
