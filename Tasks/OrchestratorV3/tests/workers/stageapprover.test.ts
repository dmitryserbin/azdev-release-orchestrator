import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";
import * as faker from "faker";

import { Build, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper";
import { ISettings } from "../../helpers/taskhelper/isettings";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";
import { IStageSelector } from "../../helpers/stageselector/istageselector";
import { IStageApprover } from "../../workers/stageapprover/istageapprover";
import { StageApprover } from "../../workers/stageapprover/stageapprover";
import { IBuildSelector } from "../../helpers/buildselector/ibuildselector";
import { IBuildApproval } from "../../workers/progressmonitor/ibuildapproval";
import { IBuildCheck } from "../../workers/progressmonitor/ibuildcheck";

describe("StageApprover", async () => {

    const loggerMock = TypeMoq.Mock.ofType<ILogger>();
    const debugMock = TypeMoq.Mock.ofType<IDebug>();

    loggerMock
        .setup((x) => x.log(TypeMoq.It.isAny()))
        .returns(() => null);

    loggerMock
        .setup((x) => x.extend(TypeMoq.It.isAnyString()))
        .returns(() => debugMock.object);

    debugMock
        .setup((x) => x.extend(TypeMoq.It.isAnyString()))
        .returns(() => debugMock.object);

    const buildMock = {

        buildNumber: faker.random.word(),
        id: faker.datatype.number(),

    } as Build;

    let settingsMock: ISettings;
    let stageOneMock: IBuildStage;
    let approvalOneMock: IBuildApproval;
    let checkOneMock: IBuildCheck;

    const commonHelperMock = TypeMoq.Mock.ofType<ICommonHelper>();
    const buildSelectorMock = TypeMoq.Mock.ofType<IBuildSelector>();
    const stageSelectorMock = TypeMoq.Mock.ofType<IStageSelector>();

    const stageApprover: IStageApprover = new StageApprover(buildSelectorMock.object, stageSelectorMock.object, commonHelperMock.object, loggerMock.object);

    beforeEach(async () => {

        commonHelperMock.reset();
        buildSelectorMock.reset();
        stageSelectorMock.reset();

        settingsMock = {

            proceedSkippedStages: false,
            cancelFailedCheckpoint: true,
            updateInterval: 1,
            approvalAttempts: 0,

        } as ISettings;

        approvalOneMock = {

            id: faker.random.word(),
            state: TimelineRecordState.Pending,
            result: null,

        } as IBuildApproval;

        checkOneMock = {

            id: faker.random.word(),
            state: TimelineRecordState.Pending,
            result: null,

        } as IBuildCheck;

        stageOneMock = {

            id: faker.random.word(),
            name: faker.random.word(),
            state: TimelineRecordState.Pending,
            attempt: {
                approval: 0,
                check: 0,
            },
            approvals: [ approvalOneMock ],
            checks: [ checkOneMock ],

        } as IBuildStage;

    });

    it("Should successfully approve stage", async () => {

        //#region ARRANGE

        const approvedResult = { status: `approved` };

        stageSelectorMock
            .setup((x) => x.approveStage(buildMock, approvalOneMock, undefined))
            .returns(() => Promise.resolve(approvedResult))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await stageApprover.approve(stageOneMock, buildMock, settingsMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        stageSelectorMock.verifyAll();

        //#endregion

    });

    it("Should fail approval and cancel stage", async () => {

        //#region ARRANGE

        const approvedResult = { status: `failed` };

        stageSelectorMock
            .setup((x) => x.approveStage(buildMock, approvalOneMock, undefined))
            .returns(() => Promise.resolve(approvedResult))
            .verifiable(TypeMoq.Times.once());

        buildSelectorMock
            .setup((x) => x.cancelBuild(buildMock))
            .returns(() => Promise.resolve(buildMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        await chai.expect(stageApprover.approve(stageOneMock, buildMock, settingsMock)).to.be.rejected;

        //#endregion

        //#region ASSERT

        stageSelectorMock.verifyAll();
        buildSelectorMock.verifyAll();

        //#endregion

    });

    it("Should successfully validate stage check", async () => {

        //#region ARRANGE

        checkOneMock.state = TimelineRecordState.Completed;

        //#endregion

        //#region ACT

        const result = await stageApprover.check(stageOneMock, buildMock, settingsMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

    it("Should fail validating and cancel stage", async () => {

        //#region ARRANGE

        buildSelectorMock
            .setup((x) => x.cancelBuild(buildMock))
            .returns(() => Promise.resolve(buildMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        await chai.expect(stageApprover.check(stageOneMock, buildMock, settingsMock)).to.be.rejected;

        //#endregion

        //#region ASSERT

        buildSelectorMock.verifyAll();

        //#endregion

    });

    it("Confirm pending approval", async () => {

        //#region ACT

        const result = stageApprover.isApprovalPending(stageOneMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.eq(true);

        //#endregion

    });

    it("Confirm pending check", async () => {

        //#region ACT

        const result = stageApprover.isCheckPending(stageOneMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.eq(true);

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
