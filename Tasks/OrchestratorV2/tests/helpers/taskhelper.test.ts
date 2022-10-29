import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";
import { ImportMock } from "ts-mock-imports";

import * as TaskLibrary from "azure-pipelines-task-lib/task";

import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { TaskHelper } from "../../helpers/taskhelper";
import { ITaskHelper } from "../../interfaces/helpers/taskhelper";
import { CommonHelper } from "../../helpers/commonhelper";

describe("TaskHelper", () => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const endpointNameMock: string = "My-Endpoint";
    const endpointUrlMock: string = "https://dev.azure.com/My-Organization";
    const endpointTokenMock: string = "My-Token";

    const orchestratorProjectNameMock: string = "My-Orchestrator-Project";
    const orchestratorReleaseNameMock: string = "My-Orchestrator-Release";
    const orchestratorRequesterNameMock: string = "My-Requester-Name";
    const orchestratorRequesterIdMock: string = "My-Requester-Id";

    const projectNameMock: string = "My-Project";
    const definitionNameMock: string = "My-Definition";
    const definitionStageMock: string = "DEV,TEST,PROD";
    const releaseNameMock: string = "My-Release";
    const releaseStageMock: string = "DEV,TEST,PROD";

    const releaseTagMock: string = "My-Tag-One,My-Tag-Two";
    const artifactVersionMock: string = "My-Build-01";
    const artifactTagMock: string = "My-Artifact-Tag-One,My-Artifact-Tag-Two";
    const artifactBranchMock: string = "My-Branch";
    const stageStatusMock: string = "succeeded,rejected";

    const releaseVariablesMock: string = "My-Variable-One=My-Value-One";

    const updateIntervalMock: string = "1";
    const approvalRetryMock: string = "1";

    let inputs: {[key: string]: string | boolean};
    let variables: {[key: string]: string};

    const taskHelper: ITaskHelper = new TaskHelper(debugCreatorMock.target, new CommonHelper(debugCreatorMock.object));

    beforeEach(async () => {

        const getInputMock = ImportMock.mockFunction(TaskLibrary, "getInput");
        getInputMock.callsFake(i => {

            return inputs[i] || null;

        });

        const getBoolInputMock = ImportMock.mockFunction(TaskLibrary, "getBoolInput");
        getBoolInputMock.callsFake(i => {

            return (typeof inputs[i] === "boolean") ? inputs[i] : false;

        });

        const getDelimitedInputMock = ImportMock.mockFunction(TaskLibrary, "getDelimitedInput");
        getDelimitedInputMock.callsFake(i => {

            return inputs[i] ? inputs[i].toString().split(",") : [];

        });

        const getVariableMock = ImportMock.mockFunction(TaskLibrary, "getVariable");
        getVariableMock.callsFake(i => {

            return variables[i] || null;

        });

        inputs = {};
        variables = {};

    });

    afterEach(async () => {

        ImportMock.restore();

    });

    it("Should get service endpoint", async () => {

        //#region ARRANGE

        inputs["endpointName"] = endpointNameMock;
        inputs["endpointType"] = "service";

        const getEndpointUrlMock = ImportMock.mockFunction(TaskLibrary, "getEndpointUrl");
        getEndpointUrlMock.callsFake(() => endpointUrlMock);

        const getEndpointAuthorizationParameterMock = ImportMock.mockFunction(TaskLibrary, "getEndpointAuthorizationParameter");
        getEndpointAuthorizationParameterMock.callsFake(() => endpointTokenMock);

        //#endregion

        //#region ACT

        const result = await taskHelper.getEndpoint();

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.url).to.eq(endpointUrlMock);
        chai.expect(result.token).to.eq(endpointTokenMock);

        //#endregion

    });

    it("Should get new release parameters", async () => {

        //#region ARRANGE

        inputs["releaseStrategy"] = "create";
        inputs["projectName"] = projectNameMock;
        inputs["definitionName"] = definitionNameMock;

        inputs["definitionStage"] = definitionStageMock;
        inputs["artifactVersion"] = artifactVersionMock;
        inputs["artifactTag"] = artifactTagMock;
        inputs["artifactBranch"] = artifactBranchMock;
        inputs["releaseVariables"] = releaseVariablesMock;

        inputs["updateInterval"] = updateIntervalMock;
        inputs["approvalRetry"] = approvalRetryMock;

        //#endregion

        //#region ACT

        const result = await taskHelper.getParameters();

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.releaseType).to.eq("New");
        chai.expect(result.projectName).to.eq(projectNameMock);
        chai.expect(result.definitionName).to.eq(definitionNameMock);

        chai.expect(result.settings.sleep).to.eq(Number(updateIntervalMock) * 1000);
        chai.expect(result.settings.approvalRetry).to.eq(Number(approvalRetryMock));

        chai.expect(result.stages).to.eql([ "DEV", "TEST", "PROD" ]);
        chai.expect(result.filters.artifactVersion).to.eq(artifactVersionMock);
        chai.expect(result.filters.artifactTags).to.eql([ "My-Artifact-Tag-One", "My-Artifact-Tag-Two" ]);
        chai.expect(result.filters.artifactBranch).to.eq(artifactBranchMock);

        chai.expect(result.variables.length).to.eq(1);
        chai.expect(result.variables[0].name).to.eq("My-Variable-One");
        chai.expect(result.variables[0].value).to.eq("My-Value-One");

        //#endregion

    });

    it("Should get latest release parameters", async () => {

        //#region ARRANGE

        inputs["releaseStrategy"] = "latest";
        inputs["projectName"] = projectNameMock;
        inputs["definitionName"] = definitionNameMock;

        inputs["releaseStage"] = releaseStageMock;
        inputs["releaseTag"] = releaseTagMock;
        inputs["artifactVersion"] = artifactVersionMock;
        inputs["artifactTag"] = artifactTagMock;
        inputs["artifactBranch"] = artifactBranchMock;
        inputs["stageStatus"] = stageStatusMock;

        inputs["updateInterval"] = updateIntervalMock;
        inputs["approvalRetry"] = approvalRetryMock;

        //#endregion

        //#region ACT

        const result = await taskHelper.getParameters();

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.releaseType).to.eq("Latest");
        chai.expect(result.projectName).to.eq(projectNameMock);
        chai.expect(result.definitionName).to.eq(definitionNameMock);

        chai.expect(result.settings.sleep).to.eq(Number(updateIntervalMock) * 1000);
        chai.expect(result.settings.approvalRetry).to.eq(Number(approvalRetryMock));

        chai.expect(result.stages).to.eql([ "DEV", "TEST", "PROD" ]);
        chai.expect(result.filters.releaseTags).to.eql([ "My-Tag-One", "My-Tag-Two" ]);
        chai.expect(result.filters.artifactVersion).to.eq(artifactVersionMock);
        chai.expect(result.filters.artifactTags).to.eql([ "My-Artifact-Tag-One", "My-Artifact-Tag-Two" ]);
        chai.expect(result.filters.artifactBranch).to.eq(artifactBranchMock);
        chai.expect(result.filters.stageStatuses).to.eql([ "succeeded", "rejected" ]);

        //#endregion

    });

    it("Should get specific release parameters", async () => {

        //#region ARRANGE

        inputs["releaseStrategy"] = "specific";
        inputs["projectName"] = projectNameMock;
        inputs["definitionName"] = definitionNameMock;

        inputs["releaseName"] = releaseNameMock;
        inputs["releaseStage"] = releaseStageMock;

        inputs["updateInterval"] = updateIntervalMock;
        inputs["approvalRetry"] = approvalRetryMock;

        //#endregion

        //#region ACT

        const result = await taskHelper.getParameters();

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.releaseType).to.eq("Specific");
        chai.expect(result.projectName).to.eq(projectNameMock);
        chai.expect(result.definitionName).to.eq(definitionNameMock);

        chai.expect(result.settings.sleep).to.eq(Number(updateIntervalMock) * 1000);
        chai.expect(result.settings.approvalRetry).to.eq(Number(approvalRetryMock));

        chai.expect(result.releaseName).to.eq(releaseNameMock);
        chai.expect(result.stages).to.eql([ "DEV", "TEST", "PROD" ]);

        //#endregion

    });

    it("Should get orchestrator details", async () => {

        //#region ARRANGE

        inputs["endpointName"] = endpointNameMock;

        variables["SYSTEM_TEAMPROJECT"] = orchestratorProjectNameMock;
        variables["RELEASE_RELEASENAME"] = orchestratorReleaseNameMock;
        variables["RELEASE_DEPLOYMENT_REQUESTEDFOR"] = orchestratorRequesterNameMock;
        variables["RELEASE_DEPLOYMENT_REQUESTEDFORID"] = orchestratorRequesterIdMock;

        //#endregion

        //#region ACT

        const result = await taskHelper.getDetails();

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.endpointName).to.eq(endpointNameMock);
        chai.expect(result.projectName).to.eq(orchestratorProjectNameMock);
        chai.expect(result.releaseName).to.eq(orchestratorReleaseNameMock);
        chai.expect(result.requesterName).to.eq(orchestratorRequesterNameMock);
        chai.expect(result.requesterId).to.eq(orchestratorRequesterIdMock);

        //#endregion

    });

});
