import * as path from "path";

import * as mr from "azure-pipelines-task-lib/mock-run";

import { MockEndpoint, MockInput } from "./helpers";

const tmr: mr.TaskMockRunner = new mr.TaskMockRunner(path.join(__dirname, "..", "index.js"));

MockEndpoint(tmr, process.env.EndpointType, process.env.EndpointName, process.env.EndpointAccount, process.env.EndpointToken);

MockInput(tmr, [

    "TargetProject",
    "TargetDefinition",
    "ReleaseStrategy",
    "IgnoreFailure",

    "DefinitionStagesFilter",
    "TargetDefinitionStages",
    "TargetRelease",
    "TargetReleaseStages",
    "ReleaseTagFilter",
    "ReleaseTagName",
    "ArtifactTagFilter",
    "ArtifactTagName",
    "SourceBranchFilter",
    "SourceBranchName",

    "ConnectedService",
    "SYSTEM_TEAMPROJECT",
    "RELEASE_RELEASENAME",
    "RELEASE_DEPLOYMENT_REQUESTEDFOR",
    "RELEASE_DEPLOYMENT_REQUESTEDFORID",

]);

tmr.run();
