import { getInput, getEndpointUrl, getEndpointAuthorizationParameter, getBoolInput, getDelimitedInput, getVariable, setResult, TaskResult } from "azure-pipelines-task-lib/task";

import { ITaskHelper } from "./itaskhelper";
import { IEndpoint } from "./iendpoint";
import { IParameters } from "./iparameters";
import { Strategy } from "./strategy";
import { IDebug } from "../../loggers/idebug";
import { IDetails } from "./idetails";
import { RunStatus } from "../../orchestrator/runstatus";
import { IFilters } from "./ifilters";
import { ISettings } from "./isettings";
import { ILogger } from "../../loggers/ilogger";
import { ICommonHelper } from "../commonhelper/icommonhelper";

export class TaskHelper implements ITaskHelper {

    private debugLogger: IDebug;
    private commonHelper: ICommonHelper;

    constructor(logger: ILogger, commonHelper: ICommonHelper) {

        this.debugLogger = logger.extend(this.constructor.name);
        this.commonHelper = commonHelper;

    }

    public async getEndpoint(): Promise<IEndpoint> {

        const debug = this.debugLogger.extend(this.getEndpoint.name);

        const endpointType: string = getInput("endpointType", true)!;

        // Use upper-case default system endpoint name
        // For compartability with non-Windows systems
        let endpointName: string = "SYSTEMVSSCONNECTION";
        let tokenParameterName: string = "AccessToken";

        if (endpointType === "service") {

            endpointName = getInput("endpointName", true)!;
            tokenParameterName = "ApiToken";

        }

        let endpointUrl: string | undefined = getEndpointUrl(endpointName, false);

        if (!endpointUrl) {

            throw new Error(`Unable to get <${endpointName}> endpoint URL`);

        }

        // Target generic Azure DevOps API URL
        // When using default system endpoint
        if (endpointType === "integrated") {

            endpointUrl = endpointUrl.replace(`vsrm.`, ``);

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

        const strategy: string = getInput("strategy", true)!;
        const projectName: string = getInput("projectName", true)!;
        const definitionName: string = getInput("definitionName", true)!;

        const cancelFailedCheckpoint: boolean = getBoolInput("cancelFailedCheckpoint", false);
        const proceedSkippedStages: boolean = getBoolInput("proceedSkippedStages", false);
        const skipTracking: boolean = getBoolInput("skipTracking", false);

        const updateInterval: string = getInput("updateInterval", true)!;
        const stageStartAttempts: string = getInput("stageStartAttempts", true)!;
        const stageStartInterval: string = getInput("stageStartInterval", true)!;
        const approvalInterval: string = getInput("approvalInterval", true)!;
        const approvalAttempts: string = getInput("approvalAttempts", true)!;

        const filters: IFilters = {

            buildNumber: "",
            branchName: "",
            buildResult: "",
            buildTags: [],
            pipelineResources: {},
            repositoryResources: {},

        };

        const settings: ISettings = {

            updateInterval: Number(updateInterval) * 1000,
            stageStartAttempts: Number(stageStartAttempts),
            stageStartInterval: Number(stageStartInterval) * 1000,
            approvalInterval: Number(approvalInterval) * 1000,
            approvalAttempts: Number(approvalAttempts),
            cancelFailedCheckpoint,
            proceedSkippedStages,
            skipTracking,

        };

        const details: IDetails = await this.readDetails();

        let parameters: IParameters = {

            strategy: Strategy.New,
            projectName: projectName,
            definitionName: definitionName,
            stages: [],
            parameters: {},
            filters,
            settings,
            details,

        };

        switch (strategy) {

            case "new": {

                parameters = await this.readNewInputs(parameters);

                break;

            } case "latest": {

                parameters = await this.readLatestInputs(parameters);

                break;

            } case "specific": {

                parameters = await this.readSpecificInputs(parameters);

                break;

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

    private async readDetails(): Promise<IDetails> {

        const debug = this.debugLogger.extend(this.readDetails.name);

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

    private async readNewInputs(parameters: IParameters): Promise<IParameters> {

        parameters.strategy = Strategy.New;

        // Optional to support variable input
        const stages: string[] = getDelimitedInput("stages", ",", false);
        const branchName: string | undefined = getInput("branchName", false);
        const pipelineParameters: string[] = getDelimitedInput("parameters", "\n", false);

        if (stages.length) {

            parameters.stages = stages;

        }

        if (branchName) {

            parameters.filters.branchName = branchName;

        }

        if (pipelineParameters.length) {

            for (const parameter of pipelineParameters) {

                const value: [string, string] = this.commonHelper.parseKeyValue(parameter);

                if (value) {

                    parameters.parameters[value[0]] = value[1];

                }

            }

        }

        return parameters;

    }

    private async readLatestInputs(parameters: IParameters): Promise<IParameters> {

        parameters.strategy = Strategy.Latest;

        // Optional to support variable input
        const stages: string[] = getDelimitedInput("stages", ",", false);
        const branchName: string | undefined = getInput("branchName", false);
        const buildResult: string | undefined = getInput("buildResult", false);
        const buildTags: string[] = getDelimitedInput("buildTags", ",", false);

        if (stages.length) {

            parameters.stages = stages;

        }

        if (branchName) {

            parameters.filters.branchName = branchName;

        }

        if (buildResult) {

            parameters.filters.buildResult = buildResult;

        }

        if (buildTags.length) {

            parameters.filters.buildTags = buildTags;

        }

        return parameters;

    }

    private async readSpecificInputs(parameters: IParameters): Promise<IParameters> {

        parameters.strategy = Strategy.Specific;

        const stages: string[] = getDelimitedInput("stages", ",", false);
        const buildNumber: string = getInput("buildName", true)!;

        if (stages.length) {

            parameters.stages = stages;

        }

        parameters.filters.buildNumber = buildNumber;

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
