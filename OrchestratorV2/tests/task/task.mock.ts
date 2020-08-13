
import { join } from "path";

import { TaskMockRunner } from "azure-pipelines-task-lib/mock-run";

import { mockEndpoint, mockInput } from "./helpers";

const path: string = join(__dirname, "../..", "task.js");

const endpointType: string = process.env.EndpointType!;
const endpointName: string = process.env.EndpointName!;
const accountName: string = process.env.EndpointAccount!;
const accountToken: string = process.env.EndpointToken!;

const inputs: string[] = [

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

];

const taskRunner: TaskMockRunner = new TaskMockRunner(path);

mockEndpoint(taskRunner, endpointType, endpointName, accountName, accountToken);
mockInput(taskRunner, inputs);

taskRunner.run();