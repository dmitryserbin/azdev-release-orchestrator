import "mocha";

import * as chai from "chai";
import * as path from "path";

import * as mt from "azure-pipelines-task-lib/mock-test";

import { SetProcessVariables, ClearProcessVariables } from "./helpers";

describe("Endpoint", () => {

    it("Should get service endpoint", async () => {

        var variables: any = {

            EndpointType: "service",
            EndpointName: "MyEndpoint",
            EndpointAccount: "MyAccount",
            EndpointToken: "MyToken"

        }

        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.getEndpoint.js"));
        tr.run();

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        chai.assert.isTrue(tr.stdOutContained(`url: 'https://dev.azure.com/${variables.EndpointAccount}'`), "Should display URL");
        chai.assert.isTrue(tr.stdOutContained(`token: '${variables.EndpointToken}'`), "Should display token");

        ClearProcessVariables(variables);

    });

    it("Should get integrated endpoint", async () => {

        var variables: any = {

            EndpointType: "integrated",

        }

        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.getEndpoint.js"));
        tr.run();

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        chai.assert.isTrue(tr.stdOutContained(`url: 'https://dev.azure.com/Integrated'`), "Should display URL");
        chai.assert.isTrue(tr.stdOutContained(`token: 'Integrated'`), "Should display token");

        ClearProcessVariables(variables);

    });

});

describe("Parameters", () => {

    it("Should get new release parameters", async () => {

        const variables: any = {

            ReleaseStrategy: "create",
            TargetProject: "1",
            TargetDefinition: "2",

        };

        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.getParameters.js"));
        tr.run();

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        chai.assert.isTrue(tr.stdOutContained(`projectId: '${variables.TargetProject}'`), "Should display project ID");
        chai.assert.isTrue(tr.stdOutContained(`definitionId: '${variables.TargetDefinition}'`), "Should display definition ID");
        chai.assert.isTrue(tr.stdOutContained(`releaseType: 'Create'`), "Should display release type");
        chai.assert.isTrue(tr.stdOutContained(`stages: []`), "Should display stages");
        chai.assert.isTrue(tr.stdOutContained(`artifactTag: []`), "Should display artifact filter");
        chai.assert.isTrue(tr.stdOutContained(`sourceBranch: ''`), "Should display source branch filter");

        ClearProcessVariables(variables);

    });

    it("Should get new release with stages parameters", async () => {

        const variables: any = {

            ReleaseStrategy: "create",
            TargetProject: "1",
            TargetDefinition: "2",
            DefinitionStagesFilter: "true",
            TargetDefinitionStages: "DEV,TEST,PROD",

        };

        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.getParameters.js"));
        tr.run();

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        chai.assert.isTrue(tr.stdOutContained(`projectId: '${variables.TargetProject}'`), "Should display project ID");
        chai.assert.isTrue(tr.stdOutContained(`definitionId: '${variables.TargetDefinition}'`), "Should display definition ID");
        chai.assert.isTrue(tr.stdOutContained(`releaseType: 'Create'`), "Should display release type");
        chai.assert.isTrue(tr.stdOutContained(`stages: [ 'DEV', 'TEST', 'PROD' ]`), "Should display stages");
        chai.assert.isTrue(tr.stdOutContained(`artifactTag: []`), "Should display artifact filter");
        chai.assert.isTrue(tr.stdOutContained(`sourceBranch: ''`), "Should display source branch filter");

        ClearProcessVariables(variables);

    });

    it("Should get new release with artifacts parameters", async () => {

        const variables: any = {

            ReleaseStrategy: "create",
            TargetProject: "1",
            TargetDefinition: "2",
            ArtifactTagFilter: "true",
            ArtifactTagName: "My-Artifact-Tag",

        };

        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.getParameters.js"));
        tr.run();

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        chai.assert.isTrue(tr.stdOutContained(`projectId: '${variables.TargetProject}'`), "Should display project ID");
        chai.assert.isTrue(tr.stdOutContained(`definitionId: '${variables.TargetDefinition}'`), "Should display definition ID");
        chai.assert.isTrue(tr.stdOutContained(`releaseType: 'Create'`), "Should display release type");
        chai.assert.isTrue(tr.stdOutContained(`stages: []`), "Should display stages");
        chai.assert.isTrue(tr.stdOutContained(`artifactTag: [ 'My-Artifact-Tag' ]`), "Should display artifact filter");
        chai.assert.isTrue(tr.stdOutContained(`sourceBranch: ''`), "Should display source branch filter");

        ClearProcessVariables(variables);

    });

    it("Should get new release with branch parameters", async () => {

        const variables: any = {

            ReleaseStrategy: "create",
            TargetProject: "1",
            TargetDefinition: "2",
            SourceBranchFilter: "true",
            SourceBranchName: "My-Source-Branch",

        };

        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.getParameters.js"));
        tr.run();

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        chai.assert.isTrue(tr.stdOutContained(`projectId: '${variables.TargetProject}'`), "Should display project ID");
        chai.assert.isTrue(tr.stdOutContained(`definitionId: '${variables.TargetDefinition}'`), "Should display definition ID");
        chai.assert.isTrue(tr.stdOutContained(`releaseType: 'Create'`), "Should display release type");
        chai.assert.isTrue(tr.stdOutContained(`stages: []`), "Should display stages");
        chai.assert.isTrue(tr.stdOutContained(`artifactTag: []`), "Should display artifact filter");
        chai.assert.isTrue(tr.stdOutContained(`sourceBranch: 'My-Source-Branch'`), "Should display source branch filter");

        ClearProcessVariables(variables);

    });

    it("Should get latest active release parameters", async () => {

        const variables: any = {

            ReleaseStrategy: "latest",
            TargetProject: "1",
            TargetDefinition: "2",
            TargetReleaseStages: "DEV,TEST,PROD",

        };

        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.getParameters.js"));
        tr.run();

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        chai.assert.isTrue(tr.stdOutContained(`projectId: '${variables.TargetProject}'`), "Should display project ID");
        chai.assert.isTrue(tr.stdOutContained(`definitionId: '${variables.TargetDefinition}'`), "Should display definition ID");
        chai.assert.isTrue(tr.stdOutContained(`releaseType: 'Latest'`), "Should display release type");
        chai.assert.isTrue(tr.stdOutContained(`stages: [ 'DEV', 'TEST', 'PROD' ]`), "Should display stages");

        ClearProcessVariables(variables);

    });

    it("Should get specific release parameters", async () => {

        const variables: any = {

            ReleaseStrategy: "specific",
            TargetProject: "1",
            TargetDefinition: "2",
            TargetRelease: "3",
            TargetReleaseStages: "DEV,TEST,PROD",

        };

        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.getParameters.js"));
        tr.run();

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        chai.assert.isTrue(tr.stdOutContained(`projectId: '${variables.TargetProject}'`), "Should display project ID");
        chai.assert.isTrue(tr.stdOutContained(`definitionId: '${variables.TargetDefinition}'`), "Should display definition ID");
        chai.assert.isTrue(tr.stdOutContained(`releaseId: '${variables.TargetRelease}'`), "Should display release ID");
        chai.assert.isTrue(tr.stdOutContained(`releaseType: 'Specific'`), "Should display release type");
        chai.assert.isTrue(tr.stdOutContained(`stages: [ 'DEV', 'TEST', 'PROD' ]`), "Should display stages");

        ClearProcessVariables(variables);

    });

});

describe("Details", () => {

    it("Should get release details", async () => {

        const variables: any = {

            ConnectedService: "My-Endpoint",
            SYSTEM_TEAMPROJECT: "HelloYo",
            RELEASE_RELEASENAME: "HelloYo-20180101-1",
            RELEASE_DEPLOYMENT_REQUESTEDFOR: "My-Name",
            RELEASE_DEPLOYMENT_REQUESTEDFORID: "My-Guid",

        };

        SetProcessVariables(variables);

        const tr: mt.MockTestRunner = new mt.MockTestRunner(path.join(__dirname, "task.getDetails.js"));
        tr.run();

        chai.assert.isTrue(tr.succeeded, "Should have succeeded");
        chai.assert.isEmpty(tr.warningIssues, "Should have succeeded");
        chai.assert.isEmpty(tr.errorIssues, "Should have no errors");

        chai.assert.isTrue(tr.stdOutContained(`endpointName: '${variables.ConnectedService}'`), "Should display endpoint name");
        chai.assert.isTrue(tr.stdOutContained(`projectName: '${variables.SYSTEM_TEAMPROJECT}'`), "Should display project name");
        chai.assert.isTrue(tr.stdOutContained(`releaseName: '${variables.RELEASE_RELEASENAME}'`), "Should display release name");
        chai.assert.isTrue(tr.stdOutContained(`requesterName: '${variables.RELEASE_DEPLOYMENT_REQUESTEDFOR}'`), "Should display requester name");
        chai.assert.isTrue(tr.stdOutContained(`requesterId: '${variables.RELEASE_DEPLOYMENT_REQUESTEDFORID}'`), "Should display requester ID");

        ClearProcessVariables(variables);

    });

});