import url from "url";

import { getInput, getEndpointUrl, getEndpointAuthorizationParameter, getBoolInput, getDelimitedInput, getVariable } from "azure-pipelines-task-lib/task";

import { ITaskHelper } from "../interfaces/helpers/taskhelper";
import { IEndpoint } from "../interfaces/task/endpoint";
import { IParameters, ReleaseType } from "../interfaces/task/parameters";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IDetails } from "../interfaces/task/details";

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

        const parameters: IParameters = {

            releaseType: ReleaseType.Create,
            projectId: targetProject,
            definitionId: targetDefinition,
            releaseId: "",
            stages: [],
            releaseTag: [],
            artifactTag: [],
            sourceBranch: "",

        };

        switch (releaseStrategy) {

            case "create": {

                parameters.releaseType = ReleaseType.Create;

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

                    parameters.artifactTag = getDelimitedInput("ArtifactTagName", ",", false);

                }

                // Get artifacts source branch filter
                // Optional to support variable input
                if (sourceBranchFilter) {

                    parameters.sourceBranch = getInput("SourceBranchName", false)!;

                }

                break;

            } case "latest": {

                parameters.releaseType = ReleaseType.Latest;

                // Get release stages
                parameters.stages = getDelimitedInput("TargetReleaseStages", ",", true);

                const releaseTagFilter: boolean = getBoolInput("ReleaseTagFilter");
                const artifactTagFilter: boolean = getBoolInput("ArtifactTagFilter");
                const sourceBranchFilter: boolean = getBoolInput("SourceBranchFilter");

                // Get release tag name filter
                // Optional to support variable input
                if (releaseTagFilter) {

                    parameters.releaseTag = getDelimitedInput("ReleaseTagName", ",", false);

                }

                // Get artifact tag name filter
                // Optional to support variable input
                if (artifactTagFilter) {

                    parameters.artifactTag = getDelimitedInput("ArtifactTagName", ",", false);

                }

                // Get artifacts source branch filter
                // Optional to support variable input
                if (sourceBranchFilter) {

                    parameters.sourceBranch = getInput("SourceBranchName", false)!;

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

}
