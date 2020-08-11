import Debug from "debug";

import url from "url";

import * as tl from "azure-pipelines-task-lib/task";

import { ITaskHelper } from "../interfaces/helpers/taskhelper";
import { IEndpoint } from "../interfaces/task/endpoint";
import { IParameters, ReleaseType } from "../interfaces/task/parameters";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IDetails } from "../interfaces/task/details";

export class TaskHelper implements ITaskHelper {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

    public async getEndpoint(): Promise<IEndpoint> {

        const debug = this.debugLogger.extend(this.getEndpoint.name);

        const endpointType: string = tl.getInput("EndpointType", true)!;

        // Use upper-case default endpoint name
        // For compartability with non-Windows systems
        let endpointName: string = "SYSTEMVSSCONNECTION";
        let tokenParameterName: string = "AccessToken";

        // Get service endpoint
        if (endpointType === "service") {

            endpointName = tl.getInput("ConnectedService", true)!;
            tokenParameterName = "ApiToken";

        }

        const endpointUrl: string = tl.getEndpointUrl(endpointName, false);
        const accountName: string = url.parse(endpointUrl).pathname!.replace("/", "");
        const accountToken: string = tl.getEndpointAuthorizationParameter(endpointName, tokenParameterName, false)!;
    
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

        const releaseStrategy: string = tl.getInput("ReleaseStrategy", true)!;
        const targetProject: string = tl.getInput("TargetProject", true)!;
        const targetDefinition: string = tl.getInput("TargetDefinition", true)!;

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

                const definitionStagesFilter: boolean = tl.getBoolInput("DefinitionStagesFilter");
                const artifactTagFilter: boolean = tl.getBoolInput("ArtifactTagFilter");
                const sourceBranchFilter: boolean = tl.getBoolInput("SourceBranchFilter");

                // Get definition stages
                if (definitionStagesFilter) {

                    parameters.stages = tl.getDelimitedInput("TargetDefinitionStages", ",", true);

                }

                // Get artifact tag name filter
                // Optional to support variable input
                if (artifactTagFilter) {

                    parameters.artifactTag = tl.getDelimitedInput("ArtifactTagName", ",", false);

                }

                // Get artifacts source branch filter
                // Optional to support variable input
                if (sourceBranchFilter) {

                    parameters.sourceBranch = tl.getInput("SourceBranchName", false)!;

                }

                break;

            } case "latest": {

                parameters.releaseType = ReleaseType.Latest;

                // Get release stages
                parameters.stages = tl.getDelimitedInput("TargetReleaseStages", ",", true);

                const releaseTagFilter: boolean = tl.getBoolInput("ReleaseTagFilter");
                const artifactTagFilter: boolean = tl.getBoolInput("ArtifactTagFilter");
                const sourceBranchFilter: boolean = tl.getBoolInput("SourceBranchFilter");

                // Get release tag name filter
                // Optional to support variable input
                if (releaseTagFilter) {

                    parameters.releaseTag = tl.getDelimitedInput("ReleaseTagName", ",", false);

                }

                // Get artifact tag name filter
                // Optional to support variable input
                if (artifactTagFilter) {

                    parameters.artifactTag = tl.getDelimitedInput("ArtifactTagName", ",", false);

                }

                // Get artifacts source branch filter
                // Optional to support variable input
                if (sourceBranchFilter) {

                    parameters.sourceBranch = tl.getInput("SourceBranchName", false)!;

                }

                break;

            } case "specific": {

                parameters.releaseType = ReleaseType.Specific;

                // Get release ID
                parameters.releaseId = tl.getInput("TargetRelease", true)!;

                // Get release stages
                parameters.stages = tl.getDelimitedInput("TargetReleaseStages", ",", true);

                break;

            }

        }

        debug(parameters);

        return parameters;

    }

    public async getDetails(): Promise<IDetails> {

        const debug = this.debugLogger.extend(this.getDetails.name);

        const endpointName: string = tl.getInput("ConnectedService", false)!;

        const details: IDetails = {

            endpointName: endpointName ? endpointName : "Project Collection Build Service",
            projectName: tl.getVariable("SYSTEM_TEAMPROJECT")!,
            releaseName: tl.getVariable("RELEASE_RELEASENAME")!,
            requesterName: tl.getVariable("RELEASE_DEPLOYMENT_REQUESTEDFOR")!,
            requesterId: tl.getVariable("RELEASE_DEPLOYMENT_REQUESTEDFORID")!,

        }

        return details;

    }

}
