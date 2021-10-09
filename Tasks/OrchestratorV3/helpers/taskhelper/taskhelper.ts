import parseKeyValue from "parse-key-value-pair";

import { getInput, getEndpointUrl, getEndpointAuthorizationParameter, getBoolInput, getDelimitedInput, getVariable, setResult, TaskResult } from "azure-pipelines-task-lib/task";

import { ITaskHelper } from "./itaskhelper";
import { IEndpoint } from "./iendpoint";
import { IParameters } from "./iparameters";
import { ReleaseType } from "./releasetype";
import { IDebug } from "../../loggers/idebug";
import { IDetails } from "./idetails";
import { RunStatus } from "../../orchestrator/runstatus";
import { IFilters } from "./ifilters";
import { ISettings } from "./isettings";
import { ILogger } from "../../loggers/ilogger";

export class TaskHelper implements ITaskHelper {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

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

        const endpointUrl: string | undefined = getEndpointUrl(endpointName, false);

        if (!endpointUrl) {

            throw new Error(`Unable to get <${endpointName}> endpoint URL`);

        }

        const endpointToken: string | undefined = getEndpointAuthorizationParameter(endpointName, tokenParameterName, false);

        if (!endpointToken) {

            throw new Error(`Unable to get <${endpointName}> (${tokenParameterName}) endpoint token`);

        }

        const endpoint: IEndpoint = {

            url: endpointUrl,
            token: endpointToken,

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

            sourceBranch: "",
            pipelineResources: {},
            repositoryResources: {},
            releaseTags: [],
            artifactTags: [],
            artifactVersion: "",
            stageStatuses: [],

        };

        const settings: ISettings = {

            sleep: Number(updateInterval)
                ? Number(updateInterval) * 1000 : 5000,
            approvalRetry: Number(approvalRetry)
                ? Number(approvalRetry) : 60,
            approvalSleep: 60000,

        };

        const details: IDetails = await this.getDetails();

        let parameters: IParameters = {

            releaseType: ReleaseType.New,
            projectName: projectName,
            definitionName: definitionName,
            buildNumber: "",
            stages: [],
            parameters: {},
            filters,
            settings,
            details,

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

    public async validate(status: RunStatus): Promise<void> {

        const debug = this.debugLogger.extend(this.validate.name);

        const partialMessage: string = `One or more release stages partially succeeded`;
        const failedMessage: string = `One or more release stages deployment failed`;

        debug(status);

        switch (status) {

            case RunStatus.PartiallySucceeded: {

                if (await this.suppressSucceededWithIssues()) {

                    break;

                }

                setResult(TaskResult.SucceededWithIssues, partialMessage);

                break;

            } case RunStatus.Failed: {

                throw new Error(failedMessage);

            }

        }

    }

    public async fail(message: string): Promise<void> {

        const debug = this.debugLogger.extend(this.fail.name);

        const ignoreFailure: boolean = getBoolInput("ignoreFailure");

        const result: TaskResult = ignoreFailure
            ? TaskResult.SucceededWithIssues : TaskResult.Failed;

        debug(`Task <${TaskResult[result]}> result (ignore failure <${ignoreFailure}>)`);

        if (result === TaskResult.SucceededWithIssues && await this.suppressSucceededWithIssues()) {

            return;

        }

        setResult(result, message);

    }

    private async getDetails(): Promise<IDetails> {

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

    private async readCreateInputs(parameters: IParameters): Promise<IParameters> {

        parameters.releaseType = ReleaseType.New;

        // Optional to support variable input
        const definitionStages: string[] = getDelimitedInput("definitionStage", ",", false);
        const artifactVersion: string | undefined = getInput("artifactVersion", false);
        const artifactTags: string[] = getDelimitedInput("artifactTag", ",", false);
        const sourceBranch: string | undefined = getInput("sourceBranch", false);
        const buildParameters: string[] = getDelimitedInput("buildParameters", "\n", false);

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

        // Get source branch filter
        if (sourceBranch) {

            parameters.filters.sourceBranch = sourceBranch;

        }

        // Get build parameters
        if (buildParameters.length) {

            for (const variable of buildParameters) {

                const value: [string, string] | null = parseKeyValue(variable);

                if (value) {

                    parameters.parameters[value[0]] = value[1];

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
        const sourceBranch: string | undefined = getInput("sourceBranch", false);
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

        // Get source branch filter
        if (sourceBranch) {

            parameters.filters.sourceBranch = sourceBranch;

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

        // Get build number
        parameters.buildNumber = getInput("buildNumber", true)!;

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
