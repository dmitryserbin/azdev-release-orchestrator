/* eslint-disable @typescript-eslint/no-explicit-any */

import "mocha";

import { join } from "path";
import { assert } from "chai";

import { MockTestRunner } from "azure-pipelines-task-lib/mock-test";

import { clearMockVariables, setMockVariables } from "./helpers";

describe("Task", ()  => {

    const path: string = join(__dirname, "task.mock.js");

    const defaultVariables: any = {

        endpointType: "service",
        endpointName: "My-Endpoint",
        endpointAccount: "My-Account",
        endpointToken: "My-Token",

        projectName: "My-Project",
        definitionName: "My-Definition",
        releaseStrategy: "create",

        definitionStagesFilter: "false",
        definitionStages: "DEV,TEST,PROD",
        releaseName: null,
        releaseStages: "DEV,TEST,PROD",
        releaseTagFilter: "false",
        releaseTagName: null,
        artifactTagFilter: "false",
        artifactTagName: null,
        sourceBranchFilter: "false",
        sourceBranchName: null,

        ignoreFailure: "false",
        updateInterval: 1,
        approvalRetry: 1,

        SYSTEM_TEAMPROJECT: "HelloYo",
        RELEASE_RELEASENAME: "HelloYo-20180101-1",
        RELEASE_DEPLOYMENT_REQUESTEDFOR: "My-Name",
        RELEASE_DEPLOYMENT_REQUESTEDFORID: "My-Guid",

    };

    it("Should run orchestrator @task", async () => {

        const variables: any = Object.assign({}, defaultVariables);

        setMockVariables(variables);

        const testRunner: MockTestRunner = new MockTestRunner(path);

        testRunner.run();

        console.log(testRunner.stdout);

        assert.isTrue(testRunner.succeeded, "Should have succeeded");
        assert.isEmpty(testRunner.warningIssues, "Should have succeeded");
        assert.isEmpty(testRunner.errorIssues, "Should have no errors");

        clearMockVariables(variables);

    });

});
