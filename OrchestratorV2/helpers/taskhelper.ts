import url from "url";
import parseKeyValue from "parse-key-value-pair";

import { getInput, getEndpointUrl, getEndpointAuthorizationParameter, getBoolInput, getDelimitedInput, getVariable, setResult, TaskResult } from "azure-pipelines-task-lib/task";

import { ITaskHelper } from "../interfaces/helpers/taskhelper";
import { IEndpoint } from "../interfaces/task/endpoint";
import { IParameters } from "../interfaces/task/parameters";
import { ReleaseType } from "../interfaces/common/releasetype";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IDetails } from "../interfaces/task/details";
import { ReleaseStatus } from "../interfaces/common/releasestatus";
import { IFilters } from "../interfaces/task/filters";
import { IReleaseVariable } from "../interfaces/common/releasevariable";
import { ISettings } from "../interfaces/common/settings";

export class TaskHelper implements ITaskHelper {

    private debugLogger: IDebugLogger;

    constructor(debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

    }

    public async getEndpoint(): Promise<IEndpoint> {

        const debug = this.debugLogger.extend(this.getEndpoint.name);

        const endpointType: string = getInput("EndpointType", true)!;

        // Use upper-case default endpoint name
        // For compartability with non-Windows systems
        let endpointName: string = "SYSTEMVSSCONNECTION";
        let tokenParameterName: string = "AccessToken";

        // Get service endpoint
        if (endpointType === "service") {

            endpointName = getInput("ConnectedService", true)!;
            tokenParameterName = "ApiToken";

        }

        const endpointUrl: string = getEndpointUrl(endpointName, false);
        const accountName: string = url.parse(endpointUrl).pathname!.replace("/", "");
        const accountToken: string = getEndpointAuthorizationParameter(endpointName, tokenParameterName, false)!;
    
        const endpoint: IEndpoint = {
    
            url: endpointUrl,
            account: accountName,
            token: accountToken,

        };

        debug(endpoint);

        return endpoint;

    }

    public async getParameters(): Promise<IParameters> {

        const debug = this.debugLogger.extend(this.getParameters.name);

        const releaseStrategy: string = getInput("ReleaseStrategy", true)!;
        const targetProject: string = getInput("TargetProject", true)!;
        const targetDefinition: string = getInput("TargetDefinition", true)!;

        const updateInterval: string = getInput("UpdateInterval", true)!;
        const approvalRetry: string = getInput("ApprovalRetry", true)!;

        const filters: IFilters = {

            releaseTags: [],
            artifactTags: [],
            artifactBranch: "",
            stageStatuses: [],

        };

        const settings: ISettings = {

            sleep: Number.isFinite(updateInterval)
                ? Number(updateInterval) * 1000 : 5000,
            approvalRetry: Number.isFinite(approvalRetry)
                ? Number(approvalRetry) : 60,
            approvalSleep: 60000

        };

        const parameters: IParameters = {

            releaseType: ReleaseType.New,
            projectId: targetProject,
            definitionId: targetDefinition,
            releaseId: "",
            stages: [],
            variables: [],
            filters,
            settings,

        };

        switch (releaseStrategy) {

            case "create": {

                parameters.releaseType = ReleaseType.New;

                const definitionStagesFilter: boolean = getBoolInput("DefinitionStagesFilter");
                const artifactTagFilter: boolean = getBoolInput("ArtifactTagFilter");
                const sourceBranchFilter: boolean = getBoolInput("SourceBranchFilter");

                // Get definition stages
                if (definitionStagesFilter) {

                    parameters.stages = getDelimitedInput("TargetDefinitionStages", ",", true);

                }

                // Get artifact tag name filter
                // Optional to support variable input
                if (artifactTagFilter) {

                    filters.artifactTags = getDelimitedInput("ArtifactTagName", ",", false);

                }

                // Get artifacts source branch filter
                // Optional to support variable input
                if (sourceBranchFilter) {

                    filters.artifactBranch = getInput("SourceBranchName", false)!;

                }

                // Get release variables
                const releaseVariables: string[] = getDelimitedInput("ReleaseVariables", "\n", false);

                if (releaseVariables.length > 0) {

                    for (const variable of releaseVariables) {

                        const value: [string, string] | null = parseKeyValue(variable);

                        if (value) {

                            const releaseVariable: IReleaseVariable = {

                                name: value[0],
                                value: value[1],

                            };

                            parameters.variables.push(releaseVariable);

                        }

                    }

                }

                break;

            } case "latest": {

                parameters.releaseType = ReleaseType.Latest;

                // Get release stages
                parameters.stages = getDelimitedInput("TargetReleaseStages", ",", true);

                const releaseTagFilter: boolean = getBoolInput("ReleaseTagFilter");
                const artifactTagFilter: boolean = getBoolInput("ArtifactTagFilter");
                const sourceBranchFilter: boolean = getBoolInput("SourceBranchFilter");
                const stageStatusFilter: boolean = getBoolInput("StageStatusFilter");

                // Get release tag name filter
                // Optional to support variable input
                if (releaseTagFilter) {

                    filters.releaseTags = getDelimitedInput("ReleaseTagName", ",", false);

                }

                // Get artifact tag name filter
                // Optional to support variable input
                if (artifactTagFilter) {

                    filters.artifactTags = getDelimitedInput("ArtifactTagName", ",", false);

                }

                // Get artifacts source branch filter
                // Optional to support variable input
                if (sourceBranchFilter) {

                    filters.artifactBranch = getInput("SourceBranchName", false)!;

                }

                // Get release stage status filter
                // Optional to support variable input
                if (stageStatusFilter) {

                    filters.stageStatuses = getDelimitedInput("StageStatus", ",", true);

                }

                break;

            } case "specific": {

                parameters.releaseType = ReleaseType.Specific;

                // Get release ID
                parameters.releaseId = getInput("TargetRelease", true)!;

                // Get release stages
                parameters.stages = getDelimitedInput("TargetReleaseStages", ",", true);

                break;

            }

        }

        debug(parameters);

        return parameters;

    }

    public async getDetails(): Promise<IDetails> {

        const debug = this.debugLogger.extend(this.getDetails.name);

        const endpointName: string = getInput("ConnectedService", false)!;

        const details: IDetails = {

            endpointName: endpointName ? endpointName : "Project Collection Build Service",
            projectName: getVariable("SYSTEM_TEAMPROJECT")!,
            releaseName: getVariable("RELEASE_RELEASENAME")!,
            requesterName: getVariable("RELEASE_DEPLOYMENT_REQUESTEDFOR")!,
            requesterId: getVariable("RELEASE_DEPLOYMENT_REQUESTEDFORID")!,

        }

        debug(details);

        return details;

    }

    public async validate(status: ReleaseStatus): Promise<void> {

        const debug = this.debugLogger.extend(this.validate.name);

        const partialMessage: string = `One or more release stages partially succeeded`;
        const failedMessage: string = `One or more release stages deployment failed`;

        debug(status);

        switch (status) {

            case ReleaseStatus.PartiallySucceeded: {

                setResult(TaskResult.SucceededWithIssues, partialMessage);

                break;

            } case ReleaseStatus.Failed: {

                throw new Error(failedMessage);

            }

        }

    }

    public async fail(message: string): Promise<void> {

        const debug = this.debugLogger.extend(this.fail.name);

        const result: TaskResult = getBoolInput("IgnoreFailure")
            ? TaskResult.SucceededWithIssues : TaskResult.Failed;

        setResult(result, message);

    }

}
