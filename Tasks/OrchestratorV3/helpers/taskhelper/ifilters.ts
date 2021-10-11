export interface IFilters {

    buildNumber: string;
    branchName: string;
    buildResult: string;
    buildTags: string[];
    pipelineResources: {
        [key: string]: string;
    };
    repositoryResources: {
        [key: string]: string;
    };

}
