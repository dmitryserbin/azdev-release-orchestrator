export interface IFilters {

    sourceBranch: string;
    pipelineResources: {
        [key: string]: string,
    },
    repositoryResources: {
        [key: string]: string,
    },
    releaseTags: string[];
    artifactTags: string[];
    artifactVersion: string;
    stageStatuses: string[];

}
