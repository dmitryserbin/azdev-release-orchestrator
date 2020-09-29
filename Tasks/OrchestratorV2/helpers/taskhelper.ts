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

        const endpointType: string = getInput("endpointType", true)!;

        // Use upper-case default endpoint name
        // For compartability with non-Windows systems
        let endpointName: string = "SYSTEMVSSCONNECTION";
        let tokenParameterName: string = "AccessToken";

        // Get service endpoint
        if (endpointType === "service") {

            endpointName = getInput("endpointName", true)!;
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

        const releaseStrategy: string = getInput("releaseStrategy", true)!;
        const projectName: string = getInput("projectName", true)!;
        const definitionName: string = getInput("definitionName", true)!;

        const updateInterval: string = getInput("updateInterval", true)!;
        const approvalRetry: string = getInput("approvalRetry", true)!;

        const filters: IFilters = {

            releaseTags: [],
            artifactTags: [],
            artifactVersion: "",
            artifactBranch: "",
            stageStatuses: [],

        };

        const settings: ISettings = {

            sleep: Number(updateInterval)
                ? Number(updateInterval) * 1000 : 5000,
            approvalRetry: Number(approvalRetry)
                ? Number(approvalRetry) : 60,
            approvalSleep: 60000,

        };

        let parameters: IParameters = {

            releaseType: ReleaseType.New,
            projectName: projectName,
            definitionName: definitionName,
            releaseName: "",
            stages: [],
            variables: [],
            filters,
            settings,

        };

        switch (releaseStrategy) {

            case "create": {

                parameters = await this.readCreateInputs(parameters);

                break;

            } case "latest": {

                parameters = await this.readLatestInputs(parameters);

                break;

            } case "specific": {

                parameters = await this.readSpecificInputs(parameters);

                break;

            } default: {

                throw new Error(`Release strategy <${releaseStrategy}> not supported`);

            }

        }

        debug(parameters);

        return parameters;

    }

    public async getDetails(): Promise<IDetails> {

        const debug = this.debugLogger.extend(this.getDetails.name);

        const endpointName: string | undefined = getInput("endpointName", false);
        const projectName: string | undefined = getVariable("SYSTEM_TEAMPROJECT");
        const releaseName: string | undefined = getVariable("RELEASE_RELEASENAME") ? getVariable("RELEASE_RELEASENAME") : getVariable("BUILD_BUILDNUMBER");
        const requesterName: string | undefined = getVariable("RELEASE_DEPLOYMENT_REQUESTEDFOR") ? getVariable("RELEASE_DEPLOYMENT_REQUESTEDFOR") : getVariable("BUILD_REQUESTEDFOR");
        const requesterId: string | undefined = getVariable("RELEASE_DEPLOYMENT_REQUESTEDFORID") ? getVariable("RELEASE_DEPLOYMENT_REQUESTEDFORID") : getVariable("BUILD_REQUESTEDFORID");

        const details: IDetails = {

            endpointName: endpointName ? endpointName : "Project Collection Build Service",
            projectName: projectName ? projectName : "Unknown",
            releaseName: releaseName ? releaseName : "Unknown",
            requesterName: requesterName ? requesterName : "Release Orchestrator",
            requesterId: requesterId ? requesterId : "Unknown",

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

                if (await this.suppressSucceededWithIssues()) {

                    break;

                }

                setResult(TaskResult.SucceededWithIssues, partialMessage);

                break;

            } case ReleaseStatus.Failed: {

                throw new Error(failedMessage);

            }

        }

    }

    public async fail(message: string): Promise<void> {

        const debug = this.debugLogger.extend(this.fail.name);

        const ignoreFailure: boolean = getBoolInput("ignoreFailure");

        debug(ignoreFailure);

        const result: TaskResult = ignoreFailure
            ? TaskResult.SucceededWithIssues : TaskResult.Failed;

        debug(result);

        if (result === TaskResult.SucceededWithIssues && await this.suppressSucceededWithIssues()) {

            return;

        }

        setResult(result, message);

    }

    private async readCreateInputs(parameters: IParameters): Promise<IParameters> {

        parameters.releaseType = ReleaseType.New;

        // Optional to support variable input
        const definitionStages: string[] = getDelimitedInput("definitionStage", ",", false);
        const artifactVersion: string | undefined = getInput("artifactVersion", false);
        const artifactTags: string[] = getDelimitedInput("artifactTag", ",", false);
        const artifactBranch: string | undefined = getInput("artifactBranch", false);
        const releaseVariables: string[] = getDelimitedInput("releaseVariables", "\n", false);

        // Get definition stages filter
        if (definitionStages.length) {

            parameters.stages = definitionStages;

        }

        // Get artifact version name filter
        if (artifactVersion) {

            parameters.filters.artifactVersion = artifactVersion;

        }

        // Get artifact tag name filter
        if (artifactTags.length) {

            parameters.filters.artifactTags = artifactTags;

        }

        // Get artifacts source branch filter
        if (artifactBranch) {

            parameters.filters.artifactBranch = artifactBranch;

        }

        // Get release variables
        if (releaseVariables.length) {

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

        return parameters;

    }

    private async readLatestInputs(parameters: IParameters): Promise<IParameters> {

        parameters.releaseType = ReleaseType.Latest;

        // Optional to support variable input
        const releaseStages: string[] = getDelimitedInput("releaseStage", ",", false);
        const releaseTags: string[] = getDelimitedInput("releaseTag", ",", false);
        const artifactVersion: string | undefined = getInput("artifactVersion", false);
        const artifactTags: string[] = getDelimitedInput("artifactTag", ",", false);
        const artifactBranch: string | undefined = getInput("artifactBranch", false);
        const stageStatuses: string[] = getDelimitedInput("stageStatus", ",", false);

        // Get release stages filter
        if (releaseStages.length) {

            parameters.stages = releaseStages;

        }

        // Get release tag filter
        if (releaseTags.length) {

            parameters.filters.releaseTags = releaseTags;

        }

        // Get artifact version filter
        if (artifactVersion) {

            parameters.filters.artifactVersion = artifactVersion;

        }

        // Get artifact tag filter
        if (artifactTags.length) {

            parameters.filters.artifactTags = artifactTags;

        }

        // Get artifacts source branch filter
        if (artifactBranch) {

            parameters.filters.artifactBranch = artifactBranch;

        }

        // Get release stage status filter
        if (stageStatuses.length) {

            parameters.filters.stageStatuses = stageStatuses;

        }

        return parameters;

    }

    private async readSpecificInputs(parameters: IParameters): Promise<IParameters> {

        parameters.releaseType = ReleaseType.Specific;

        const releaseStages: string[] = getDelimitedInput("releaseStage", ",", false);

        // Get release name
        parameters.releaseName = getInput("releaseName", true)!;

        // Get release stages filter
        if (releaseStages.length) {

            parameters.stages = releaseStages;

        }

        return parameters;

    }

    private async suppressSucceededWithIssues(): Promise<boolean> {

        const debug = this.debugLogger.extend(this.suppressSucceededWithIssues.name);

        const result: boolean = getVariable("RELEASE_ORCHESTRATOR_SUPPRESS_SUCCEEDEDWITHISSUES") === "true"
            ? true : false;

        debug(result);

        return result;

    }

}
