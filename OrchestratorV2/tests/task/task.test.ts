import "mocha";

import { join } from "path";
import { assert } from "chai";

import { MockTestRunner } from "azure-pipelines-task-lib/mock-test";

import { clearMockVariables, setMockVariables } from "./helpers";

describe("Orchestrator", ()  => {

    const path: string = join(__dirname, "task.mock.js");

    const defaultVariables: any = {

        EndpointType: "service",
        EndpointName: "My-Endpoint",
        EndpointAccount: process.env.azAccount ? process.env.azAccount : "My-Account",
        EndpointToken: process.env.azToken ? process.env.azToken : "My-Token",

        TargetProject: "761623f0-c4c0-4dab-884b-a428a01c200f",
        TargetDefinition: "1",
        ReleaseStrategy: null,
        IgnoreFailure: "false",

        DefinitionStagesFilter: "false",
        TargetDefinitionStages: "DEV,TEST,PROD",
        TargetRelease: null,
        TargetReleaseStages: "DEV,TEST,PROD",
        ReleaseTagFilter: "false",
        ReleaseTagName: null,
        ArtifactTagFilter: "false",
        ArtifactTagName: null,
        SourceBranchFilter: "false",
        SourceBranchName: null,

        ConnectedService: "My-Endpoint",
        SYSTEM_TEAMPROJECT: "HelloYo",
        RELEASE_RELEASENAME: "HelloYo-20180101-1",
        RELEASE_DEPLOYMENT_REQUESTEDFOR: "My-Name",
        RELEASE_DEPLOYMENT_REQUESTEDFORID: "My-Guid",

    };

    it("Should run orchestrator @task", async () => {

        const variables: any = Object.assign({}, defaultVariables);
        variables.ReleaseStrategy = "create";

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
