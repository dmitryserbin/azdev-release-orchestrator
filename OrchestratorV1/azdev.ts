import tl = require("azure-pipelines-task-lib/task");

import { IEndpoint, IParameters, IReleaseDetails, ReleaseType } from "./interfaces";

export function getEndpoint(): IEndpoint {

    const endpointType: string | undefined = tl.getInput("EndpointType", true);

    if (!endpointType) {

        throw new Error(`Unable to get <EndpointType> input`);

    }

    // Use upper-case default endpoint name
    // For better compartability with non-Windows systems
    let endpointName: string | undefined = "SYSTEMVSSCONNECTION";
    let tokenParameterName: string = "AccessToken";

    // Get service endpoint
    if (endpointType === "service") {

        endpointName = tl.getInput("ConnectedService", true);

        if (!endpointName) {

            throw new Error(`Unable to get <ConnectedService> input`);

        }

        tokenParameterName = "ApiToken";

    }

    const url: string = tl.getEndpointUrl(endpointName, false);

    if (!url) {

        throw new Error(`Unable to get <${endpointName}> endpoint URL`);

    }

    const token: string | undefined = tl.getEndpointAuthorizationParameter(endpointName, tokenParameterName, false);

    if (!token) {

        throw new Error(`Unable to get <${endpointName}> endpoint token`);

    }

    const endpoint: IEndpoint = {

        url,
        token,

    };

    return endpoint;

}

export function getParameters(): IParameters {

    const releaseStrategy: string | undefined = tl.getInput("ReleaseStrategy", true);

    if (!releaseStrategy) {

        throw new Error(`Unable to get <ReleaseStrategy> input`);

    }

    const targetProject: string | undefined = tl.getInput("TargetProject", true);

    if (!targetProject) {

        throw new Error(`Unable to get <TargetProject> input`);

    }

    const targetDefinition: string | undefined = tl.getInput("TargetDefinition", true);

    if (!targetDefinition) {

        throw new Error(`Unable to get <TargetDefinition> input`);

    }

    const parameters: IParameters = {

        releaseType: ReleaseType.Undefined,
        projectId: targetProject,
        definitionId: targetDefinition,
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

                const sourceBranchName: string | undefined = tl.getInput("SourceBranchName", false);

                if (!sourceBranchName) {

                    throw new Error(`Unable to get <SourceBranchName> input`);

                }

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

                const sourceBranchName: string | undefined = tl.getInput("SourceBranchName", false);

                if (!sourceBranchName) {

                    throw new Error(`Unable to get <SourceBranchName> input`);

                }

                parameters.sourceBranch = sourceBranchName;

            }

            break;

        }

        // Specific release
        case "specific": {

            parameters.releaseType = ReleaseType.Specific;

            // Get release ID
            const targetRelease: string | undefined = tl.getInput("TargetRelease", true);

            if (!targetRelease) {

                throw new Error(`Unable to get <TargetRelease> input`);

            }

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
