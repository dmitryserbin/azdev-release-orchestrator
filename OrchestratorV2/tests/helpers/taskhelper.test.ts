import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";
import { ImportMock } from "ts-mock-imports";

import * as TaskLibrary from "azure-pipelines-task-lib/task";

import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { TaskHelper } from "../../helpers/taskhelper";
import { ITaskHelper } from "../../interfaces/helpers/taskhelper";

describe("TaskHelper", ()  => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const endpointNameMock: string = "My-Endpoint";

    const orchestratorProjectNameMock: string = "My-Orchestrator-Project";
    const orchestratorReleaseNameMock: string = "My-Orchestrator-Release";
    const orchestratorRequesterNameMock: string = "My-Requester-Name";
    const orchestratorRequesterIdMock: string = "My-Requester-Id";

    const projectNameMock: string = "My-Project";
    const definitionNameMock: string = "My-Definition";
    const releaseNameMock: string = "My-Release";
    const releaseStagesMock: string = "DEV,TEST,PROD";
    const updateIntervalMock: string = "1";
    const approvalRetryMock: string = "1";

    let inputs: {[key: string]: string};
    let variables: {[key: string]: string};

    const taskHelper: ITaskHelper = new TaskHelper(debugCreatorMock.target);

    beforeEach(async () => {

        const getInputMock = ImportMock.mockFunction(TaskLibrary, "getInput");
        getInputMock.callsFake(i => { return inputs[i] || null; });

        const getDelimitedInputMock = ImportMock.mockFunction(TaskLibrary, "getDelimitedInput");
        getDelimitedInputMock.callsFake(i => { return inputs[i] ? inputs[i].split(",") : []; });

        const getVariableMock = ImportMock.mockFunction(TaskLibrary, "getVariable");
        getVariableMock.callsFake(i => { return variables[i] || null; });

        inputs = {};
        variables = {};

    });

    afterEach(async () => {

        ImportMock.restore();

    });

    it("Should get specific release parameters", async () => {

        //#region ARRANGE

        inputs["releaseStrategy"] = "specific";
        inputs["projectName"] = projectNameMock;
        inputs["definitionName"] = definitionNameMock;
        inputs["releaseName"] = releaseNameMock;
        inputs["releaseStages"] = releaseStagesMock;
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
        chai.expect(result.releaseName).to.eq(releaseNameMock);
        chai.expect(result.stages).to.eql([ "DEV", "TEST", "PROD" ]);
        chai.expect(result.settings.sleep).to.eq(Number(updateIntervalMock) * 1000);
        chai.expect(result.settings.approvalRetry).to.eq(Number(approvalRetryMock));

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
