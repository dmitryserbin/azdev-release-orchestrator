import "mocha";

import * as chai from "chai";
import * as path from "path";

import * as mt from "azure-pipelines-task-lib/mock-test";

import { ClearProcessVariables, SetProcessVariables } from "./helpers";

describe("Run", ()  => {

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

    it("Should deploy new release @task", async () => {

        const variables = Object.assign({}, defaultVariables);
        variables.ReleaseStrategy = "create";
        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.index.js"));
        tr.run();

        console.log(tr.stdout);

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        ClearProcessVariables(variables);

    });

    it("Should deploy new release filtered by artifact tag @task", async () => {

        const variables = Object.assign({}, defaultVariables);
        variables.ReleaseStrategy = "create";
        variables.ArtifactTagFilter = "true";
        variables.ArtifactTagName = "Build-Yo";
        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.index.js"));
        tr.run();

        console.log(tr.stdout);

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        ClearProcessVariables(variables);

    });

    it("Should deploy new release filtered by artifact branch @task", async () => {

        const variables = Object.assign({}, defaultVariables);
        variables.ReleaseStrategy = "create";
        variables.SourceBranchFilter = "true";
        variables.SourceBranchName = "refs/heads/working/test";
        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.index.js"));
        tr.run();

        console.log(tr.stdout);

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        ClearProcessVariables(variables);

    });

    it("Should re-deploy specific release @task", async () => {

        const variables = Object.assign({}, defaultVariables);
        variables.ReleaseStrategy = "specific";
        variables.TargetRelease = "162";
        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.index.js"));
        tr.run();

        console.log(tr.stdout);

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        ClearProcessVariables(variables);

    });

    it("Should re-deploy latest active release @task", async () => {

        const variables = Object.assign({}, defaultVariables);
        variables.ReleaseStrategy = "latest";
        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.index.js"));
        tr.run();

        console.log(tr.stdout);

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        ClearProcessVariables(variables);

    });

    it("Should re-deploy latest release filtered by release tag @task", async () => {

        const variables = Object.assign({}, defaultVariables);
        variables.ReleaseStrategy = "latest";
        variables.ReleaseTagFilter = "true",
        variables.ReleaseTagName = "Release-Yo";
        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.index.js"));
        tr.run();

        console.log(tr.stdout);

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        ClearProcessVariables(variables);

    });

    it("Should re-deploy latest release filtered by artifact tag @task", async () => {

        const variables = Object.assign({}, defaultVariables);
        variables.ReleaseStrategy = "latest";
        variables.ArtifactTagFilter = "true",
        variables.ArtifactTagName = "Build-Yo";
        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.index.js"));
        tr.run();

        console.log(tr.stdout);

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        ClearProcessVariables(variables);

    });

    it("Should re-deploy latest release filtered by artifact branch @task", async () => {

        const variables = Object.assign({}, defaultVariables);
        variables.ReleaseStrategy = "latest";
        variables.SourceBranchFilter = "true",
        variables.SourceBranchName = "refs/heads/working/test";
        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.index.js"));
        tr.run();

        console.log(tr.stdout);

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        ClearProcessVariables(variables);

    });

});
