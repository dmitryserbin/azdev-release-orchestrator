import "mocha";

import * as chai from "chai";
import * as mock from "azure-pipelines-task-lib/mock-test";

import { join } from "path";
import { clearMockVariables, setMockVariables } from "./helpers";

describe("Orchestrator", ()  => {

    const path: string = join(__dirname, "orchestrator.mock.js");

    const defaultVariables: any = {

        EndpointType: "service",
        EndpointName: "My-Endpoint",
        EndpointAccount: process.env.azAccount ? process.env.azAccount : "My-Account",
        EndpointToken: process.env.azToken ? process.env.azToken : "My-Secret-Token",

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

        const testRunner: mock.MockTestRunner = new mock.MockTestRunner(path);
        testRunner.run();

        console.log(testRunner.stdout);

        chai.assert.isTrue(testRunner.succeeded, "Should have succeeded");
        chai.assert.isEmpty(testRunner.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(testRunner.errorIssues, "Should have no errors");

        clearMockVariables(variables);

    });

});
