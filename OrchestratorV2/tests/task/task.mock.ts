
import { join } from "path";

import { TaskMockRunner } from "azure-pipelines-task-lib/mock-run";

import { mockEndpoint, mockInput } from "./helpers";

const path: string = join(__dirname, "../..", "task.js");

const endpointType: string = process.env.endpointType!;
const endpointName: string = process.env.endpointName!;
const accountName: string = process.env.endpointAccount!;
const accountToken: string = process.env.endpointToken!;

const inputs: string[] = [

    "endpointType",
    "endpointName",

    "projectName",
    "definitionName",
    "releaseStrategy",

    "definitionStagesFilter",
    "definitionStages",
    "releaseName",
    "releaseStages",
    "releaseTagFilter",
    "releaseTagName",
    "artifactTagFilter",
    "artifactTagName",
    "sourceBranchFilter",
    "sourceBranchName",

    "ignoreFailure",
    "updateInterval",
    "approvalRetry",

    "SYSTEM_TEAMPROJECT",
    "RELEASE_RELEASENAME",
    "RELEASE_DEPLOYMENT_REQUESTEDFOR",
    "RELEASE_DEPLOYMENT_REQUESTEDFORID",

];

const taskRunner: TaskMockRunner = new TaskMockRunner(path);

mockEndpoint(taskRunner, endpointType, endpointName, accountName, accountToken);
mockInput(taskRunner, inputs);

taskRunner.run();
