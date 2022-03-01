import { BuildResult, BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

export interface IBuildFilter {

    buildStatus: BuildStatus[];
    buildResult: BuildResult | undefined;
    tagFilters: string[];
    branchName: string;

}
