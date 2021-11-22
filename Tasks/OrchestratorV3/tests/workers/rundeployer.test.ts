import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";
import * as faker from "faker";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter";
import { IRunDeployer } from "../../workers/rundeployer/irundeployer";
import { RunDeployer } from "../../workers/rundeployer/rundeployer";
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper";
import { IStageSelector } from "../../helpers/stageselector/istageselector";
import { IStageApprover } from "../../workers/stageapprover/istageapprover";
import { IProgressMonitor } from "../../workers/progressmonitor/iprogressmonitor";
import { IRun } from "../../workers/runcreator/irun";
import { ISettings } from "../../helpers/taskhelper/isettings";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { RunStatus } from "../../orchestrator/runstatus";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob";

describe("RunDeployer", async () => {

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

    const settingsMock = {

        proceedSkippedStages: false,

    } as ISettings;

    const projectMock = {

        name: faker.random.word(),
        id: faker.random.word(),

    } as TeamProject;

    const definitionMock = {

        name: faker.random.word(),
        id: faker.datatype.number(),

    } as BuildDefinition;

    const buildMock = {

        buildNumber: faker.random.word(),
        id: faker.datatype.number(),

    } as Build;

    const runMock = {

        project: projectMock,
        definition: definitionMock,
        build: buildMock,
        stages: [],
        settings: settingsMock,

    } as IRun;

    let runProgressMock: IRunProgress;
    let stageOneMock: IBuildStage;

    const commonHelperMock = TypeMoq.Mock.ofType<ICommonHelper>();
    const stageSelectorMock = TypeMoq.Mock.ofType<IStageSelector>();
    const stageApproverMock = TypeMoq.Mock.ofType<IStageApprover>();
    const progressMonitorMock = TypeMoq.Mock.ofType<IProgressMonitor>();
    const progressReporterMock = TypeMoq.Mock.ofType<IProgressReporter>();

    const runDeployer: IRunDeployer = new RunDeployer(commonHelperMock.object, stageSelectorMock.object, stageApproverMock.object, progressMonitorMock.object, progressReporterMock.object, loggerMock.object);

    beforeEach(async () => {

        commonHelperMock.reset();
        stageSelectorMock.reset();
        stageApproverMock.reset();
        progressMonitorMock.reset();
        progressReporterMock.reset();

        stageOneMock = {

            id: faker.random.word(),
            name: faker.random.word(),
            state: TimelineRecordState.Pending,
            jobs: [] as IBuildJob[],

        } as IBuildStage;

        runProgressMock = {

            id: faker.datatype.number(),
            name: faker.random.word(),
            project: faker.random.word(),
            url: faker.random.word(),
            stages: [],
            status: RunStatus.InProgress,

        } as IRunProgress;

    });

    it("Should deploy manual", async () => {

        //#region ARRANGE

        stageOneMock.state = TimelineRecordState.Completed;

        runProgressMock.stages = [

            stageOneMock,

        ];

        progressMonitorMock
            .setup((x) => x.createRunProgress(runMock))
            .returns(() => runProgressMock)
            .verifiable(TypeMoq.Times.once());

        stageSelectorMock
            .setup((x) => x.getStage(runMock.build, stageOneMock))
            .returns(() => Promise.resolve(stageOneMock))
            .verifiable(TypeMoq.Times.once());

        progressMonitorMock
            .setup((x) => x.updateRunProgress(runProgressMock))
            .returns(() => runProgressMock)
            .verifiable(TypeMoq.Times.once());

        progressReporterMock
            .setup((x) => x.logStagesProgress(runProgressMock.stages))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await runDeployer.deployManual(runMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        commonHelperMock.verifyAll();
        stageSelectorMock.verifyAll();
        stageApproverMock.verifyAll();
        progressMonitorMock.verifyAll();
        progressReporterMock.verifyAll();

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
