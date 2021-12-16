import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";
import * as faker from "faker";

import { Build, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter";
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper";
import { ISettings } from "../../helpers/taskhelper/isettings";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob";
import { IStageDeployer } from "../../workers/stagedeployer/istagedeployer";
import { StageDeployer } from "../../workers/stagedeployer/stagedeployer";
import { IStageSelector } from "../../helpers/stageselector/istageselector";
import { IStageApprover } from "../../workers/stageapprover/istageapprover";
import { IBuildTask } from "../../workers/progressmonitor/ibuildtask";

describe("StageDeployer", async () => {

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
    let jobOneMock: IBuildJob;

    const commonHelperMock = TypeMoq.Mock.ofType<ICommonHelper>();
    const stageSelectorMock = TypeMoq.Mock.ofType<IStageSelector>();
    const stageApproverMock = TypeMoq.Mock.ofType<IStageApprover>();
    const progressReporterMock = TypeMoq.Mock.ofType<IProgressReporter>();

    const stageDeployer: IStageDeployer = new StageDeployer(commonHelperMock.object, stageSelectorMock.object, stageApproverMock.object, progressReporterMock.object, loggerMock.object);

    beforeEach(async () => {

        commonHelperMock.reset();
        stageSelectorMock.reset();
        stageApproverMock.reset();
        progressReporterMock.reset();

        settingsMock = {

            proceedSkippedStages: false,
            updateInterval: 1,

        } as ISettings;

        jobOneMock = {

            id: faker.random.word(),
            name: faker.random.word(),
            tasks: [] as IBuildTask[],

        } as IBuildJob;

        stageOneMock = {

            id: faker.random.word(),
            name: faker.random.word(),
            state: TimelineRecordState.Pending,
            jobs: [ jobOneMock ],

        } as IBuildStage;

    });

    it("Should deploy manual", async () => {

        //#region ARRANGE

        const startedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.InProgress });
        const completedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.Completed });

        stageSelectorMock
            .setup((x) => x.startStage(buildMock, stageOneMock))
            .verifiable(TypeMoq.Times.once());

        stageSelectorMock
            .setup((x) => x.confirmStage(buildMock, stageOneMock, 12))
            .returns(() => Promise.resolve(startedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        stageSelectorMock
            .setup((x) => x.getStage(buildMock, startedStageOneMock))
            .returns(() => Promise.resolve(startedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        stageApproverMock
            .setup((x) => x.isApprovalPending(startedStageOneMock))
            .returns(() => true)
            .verifiable(TypeMoq.Times.once());

        stageApproverMock
            .setup((x) => x.approve(startedStageOneMock, buildMock, settingsMock))
            .returns(() => Promise.resolve(startedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        stageApproverMock
            .setup((x) => x.isCheckPending(startedStageOneMock))
            .returns(() => true)
            .verifiable(TypeMoq.Times.once());

        stageApproverMock
            .setup((x) => x.check(startedStageOneMock, buildMock, settingsMock))
            .returns(() => Promise.resolve(completedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        progressReporterMock
            .setup((x) => x.logStageProgress(completedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        commonHelperMock
            .setup((x) => x.wait(settingsMock.updateInterval))
            .returns(() => Promise.resolve())
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await stageDeployer.deployManual(stageOneMock, buildMock, settingsMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.state).to.eq(TimelineRecordState.Completed);

        commonHelperMock.verifyAll();
        stageSelectorMock.verifyAll();
        stageApproverMock.verifyAll();
        progressReporterMock.verifyAll();

        //#endregion

    });

    it("Should deploy manual (skip tracking)", async () => {

        //#region ARRANGE

        settingsMock.skipTracking = true;

        const startedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.InProgress });

        stageSelectorMock
            .setup((x) => x.startStage(buildMock, stageOneMock))
            .verifiable(TypeMoq.Times.once());

        stageSelectorMock
            .setup((x) => x.confirmStage(buildMock, stageOneMock, 12))
            .returns(() => Promise.resolve(startedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        stageSelectorMock
            .setup((x) => x.getStage(buildMock, startedStageOneMock))
            .returns(() => Promise.resolve(startedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await stageDeployer.deployManual(stageOneMock, buildMock, settingsMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.state).to.eq(TimelineRecordState.InProgress);

        stageSelectorMock.verifyAll();

        //#endregion

    });

    it("Should deploy automated", async () => {

        //#region ARRANGE

        const startedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.InProgress, checkpoint: { state: TimelineRecordState.Pending } });
        const completedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.Completed });

        stageSelectorMock
            .setup((x) => x.getStage(buildMock, stageOneMock))
            .returns(() => Promise.resolve(startedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        stageApproverMock
            .setup((x) => x.isApprovalPending(startedStageOneMock))
            .returns(() => true)
            .verifiable(TypeMoq.Times.once());

        stageApproverMock
            .setup((x) => x.approve(startedStageOneMock, buildMock, settingsMock))
            .returns(() => Promise.resolve(startedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        stageApproverMock
            .setup((x) => x.isCheckPending(startedStageOneMock))
            .returns(() => true)
            .verifiable(TypeMoq.Times.once());

        stageApproverMock
            .setup((x) => x.check(startedStageOneMock, buildMock, settingsMock))
            .returns(() => Promise.resolve(completedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        progressReporterMock
            .setup((x) => x.logStageProgress(completedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await stageDeployer.deployAutomated(stageOneMock, buildMock, settingsMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.state).to.eq(TimelineRecordState.Completed);

        stageSelectorMock.verifyAll();
        stageApproverMock.verifyAll();
        progressReporterMock.verifyAll();

        //#endregion

    });

    it("Should deploy automated (skip tracking)", async () => {

        //#region ARRANGE

        settingsMock.skipTracking = true;

        const startedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.InProgress });

        stageSelectorMock
            .setup((x) => x.getStage(buildMock, stageOneMock))
            .returns(() => Promise.resolve(startedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await stageDeployer.deployAutomated(stageOneMock, buildMock, settingsMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.state).to.eq(TimelineRecordState.InProgress);

        stageSelectorMock.verifyAll();
        stageApproverMock.verifyAll();
        progressReporterMock.verifyAll();

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
