import tl = require("azure-pipelines-task-lib/task");

import { IEndpoint, IParameters, IReleaseDetails, ReleaseType } from "./interfaces";

export function getEndpoint(): IEndpoint {

    const endpointType: string = tl.getInput("EndpointType", true);

    // Use upper-case default endpoint name
    // For better compartability with non-Windows systems
    let endpointName: string = "SYSTEMVSSCONNECTION";
    let tokenParameterName: string = "AccessToken";

    // Get service endpoint
    if (endpointType === "service") {

        endpointName = tl.getInput("ConnectedService", true);
        tokenParameterName = "ApiToken";

    }

    const endpoint: IEndpoint = {

        url: tl.getEndpointUrl(endpointName, false),
        token: tl.getEndpointAuthorizationParameter(endpointName, tokenParameterName, false),

    };

    return endpoint;

}

export function getParameters(): IParameters {

    const releaseStrategy: string = tl.getInput("ReleaseStrategy", true);

    const parameters: IParameters = {

        releaseType: ReleaseType.Undefined,
        projectId: tl.getInput("TargetProject", true),
        definitionId: tl.getInput("TargetDefinition", true),
        releaseId: "",
        stages: [],
        releaseTag: [],
        artifactTag: [],
        sourceBranch: "",

    };

    switch (releaseStrategy) {

        // Create release
        case "create": {

            parameters.releaseType = ReleaseType.Create;

            const definitionStagesFilter: boolean = tl.getBoolInput("DefinitionStagesFilter");
            const artifactTagFilter: boolean = tl.getBoolInput("ArtifactTagFilter");
            const sourceBranchFilter: boolean = tl.getBoolInput("SourceBranchFilter");

            // Get definition stages
            if (definitionStagesFilter) {

                const targetDefinitionStages: string[] = tl.getDelimitedInput("TargetDefinitionStages", ",", true);
                parameters.stages = targetDefinitionStages;

            }

             // Get artifact tag filter
            if (artifactTagFilter) {

                const artifactTagName: string[] = tl.getDelimitedInput("ArtifactTagName", ",", false);
                parameters.artifactTag = artifactTagName;

            }

            // Get artifacts source branch filter
            if (sourceBranchFilter) {

                const sourceBranchName: string = tl.getInput("SourceBranchName", false);
                parameters.sourceBranch = sourceBranchName;

            }

            break;

        }

        // Latest release
        case "latest": {

            parameters.releaseType = ReleaseType.Latest;

            // Get release stages
            const targetReleaseStages: string[] = tl.getDelimitedInput("TargetReleaseStages", ",", true);
            parameters.stages = targetReleaseStages;

            const releaseTagFilter: boolean = tl.getBoolInput("ReleaseTagFilter");
            const artifactTagFilter: boolean = tl.getBoolInput("ArtifactTagFilter");
            const sourceBranchFilter: boolean = tl.getBoolInput("SourceBranchFilter");

            // Get release tag filter
            if (releaseTagFilter) {

                const releaseTagName: string[] = tl.getDelimitedInput("ReleaseTagName", ",", false);
                parameters.releaseTag = releaseTagName;

            }

            // Get artifact tag filter
            if (artifactTagFilter) {

                const artifactTagName: string[] = tl.getDelimitedInput("ArtifactTagName", ",", false);
                parameters.artifactTag = artifactTagName;

            }

            // Get artifacts source branch filter
            if (sourceBranchFilter) {

                const sourceBranchName: string = tl.getInput("SourceBranchName", false);
                parameters.sourceBranch = sourceBranchName;

            }

            break;

        }

        // Specific release
        case "specific": {

            parameters.releaseType = ReleaseType.Specific;

            // Get release ID
            const targetRelease: string = tl.getInput("TargetRelease", true);
            parameters.releaseId = targetRelease;

            // Get release stages
            const targetReleaseStages: string[] = tl.getDelimitedInput("TargetReleaseStages", ",", true);
            parameters.stages = targetReleaseStages;

            break;

        }

    }

    return parameters;
}

export function getReleaseDetails(): IReleaseDetails {

    return {

        endpointName: (tl.getInput("ConnectedService", false) ? tl.getInput("ConnectedService", true) : "Project Collection Build Service"),
        projectName: tl.getVariable("SYSTEM_TEAMPROJECT"),
        releaseName: tl.getVariable("RELEASE_RELEASENAME"),
        requesterName: tl.getVariable("RELEASE_DEPLOYMENT_REQUESTEDFOR"),
        requesterId: tl.getVariable("RELEASE_DEPLOYMENT_REQUESTEDFORID"),

    } as IReleaseDetails;

}
