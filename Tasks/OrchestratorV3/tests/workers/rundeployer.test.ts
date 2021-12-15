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
import { IProgressMonitor } from "../../workers/progressmonitor/iprogressmonitor";
import { IRun } from "../../workers/runcreator/irun";
import { ISettings } from "../../helpers/taskhelper/isettings";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { RunStatus } from "../../orchestrator/runstatus";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob";
import { IStageDeployer } from "../../workers/stagedeployer/istagedeployer";

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
    const stageDeployerMock = TypeMoq.Mock.ofType<IStageDeployer>();
    const progressMonitorMock = TypeMoq.Mock.ofType<IProgressMonitor>();
    const progressReporterMock = TypeMoq.Mock.ofType<IProgressReporter>();

    const runDeployer: IRunDeployer = new RunDeployer(commonHelperMock.object, stageDeployerMock.object, progressMonitorMock.object, progressReporterMock.object, loggerMock.object);

    beforeEach(async () => {

        commonHelperMock.reset();
        stageDeployerMock.reset();
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
            stages: [ stageOneMock ],
            status: RunStatus.InProgress,

        } as IRunProgress;

    });

    it("Should deploy manual", async () => {

        //#region ARRANGE

        progressMonitorMock
            .setup((x) => x.createRunProgress(runMock))
            .returns(() => runProgressMock)
            .verifiable(TypeMoq.Times.once());

        stageDeployerMock
            .setup((x) => x.deployManual(stageOneMock, runMock.build, runMock.settings))
            .returns(() => Promise.resolve(
                Object.assign({}, stageOneMock, { state: TimelineRecordState.Completed })))
            .verifiable(TypeMoq.Times.once());

        progressMonitorMock
            .setup((x) => x.updateRunProgress(runProgressMock))
            .returns(() => 
                Object.assign({}, runProgressMock, { status: RunStatus.Succeeded }))
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
        chai.expect(result.status).to.eq(RunStatus.Succeeded);

        commonHelperMock.verifyAll();
        stageDeployerMock.verifyAll();
        progressMonitorMock.verifyAll();
        progressReporterMock.verifyAll();

        //#endregion

    });

    it("Should deploy automated", async () => {

        //#region ARRANGE

        const completedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.Completed });
        const succeededRunProgressMock = Object.assign({}, runProgressMock, { status: RunStatus.Succeeded });

        progressMonitorMock
            .setup((x) => x.createRunProgress(runMock))
            .returns(() => runProgressMock)
            .verifiable(TypeMoq.Times.once());

        progressMonitorMock
            .setup((x) => x.getActiveStages(runProgressMock))
            .returns(() => [ stageOneMock ])
            .verifiable(TypeMoq.Times.once());

        stageDeployerMock
            .setup((x) => x.deployAutomated(stageOneMock, runMock.build, runMock.settings))
            .returns(() => Promise.resolve(completedStageOneMock))
            .verifiable(TypeMoq.Times.once());

        progressMonitorMock
            .setup((x) => x.updateRunProgress(runProgressMock))
            .returns(() => succeededRunProgressMock)
            .verifiable(TypeMoq.Times.once());

        progressReporterMock
            .setup((x) => x.logStagesProgress(runProgressMock.stages))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await runDeployer.deployAutomated(runMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.status).to.eq(RunStatus.Succeeded);

        commonHelperMock.verifyAll();
        stageDeployerMock.verifyAll();
        progressMonitorMock.verifyAll();
        progressReporterMock.verifyAll();

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
