import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { faker } from "@faker-js/faker";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition, TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IProgressMonitor } from "../../workers/progressmonitor/iprogressmonitor";
import { ProgressMonitor } from "../../workers/progressmonitor/progressmonitor";
import { IRun } from "../../workers/runcreator/irun";
import { ISettings } from "../../helpers/taskhelper/isettings";
import { IRunStage } from "../../workers/runcreator/irunstage";
import { RunStatus } from "../../orchestrator/runstatus";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage";

describe("ProgressMonitor", async () => {

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

    const projectMock = {

        name: faker.word.sample(),
        id: faker.word.sample(),
        _links: {
            web: {
                href: "https://my.project.uri",
            },
        },

    } as TeamProject;

    const definitionMock = {

        name: faker.word.sample(),
        id: faker.number.int(),

    } as BuildDefinition;

    const buildMock = {

        buildNumber: faker.word.sample(),
        id: faker.number.int(),

    } as Build;

    let runMock: IRun;
    let runStageOneMock: IRunStage;

    let runProgressMock: IRunProgress;
    let buildStageOneMock: IBuildStage;

    const progressMonitor: IProgressMonitor = new ProgressMonitor(loggerMock.object);

    beforeEach(async () => {

        runStageOneMock = {

            id: faker.word.sample(),
            name: faker.word.sample(),
            target: true,

        } as IRunStage;

        runMock = {

            project: projectMock,
            definition: definitionMock,
            build: buildMock,
            stages: [],
            settings: {} as ISettings,

        } as IRun;

        buildStageOneMock = {

            id: runStageOneMock.id,
            name: runStageOneMock.name,
            state: TimelineRecordState.Pending,

        } as IBuildStage;

        runProgressMock = {

            id: faker.number.int(),
            name: faker.word.sample(),
            project: faker.word.sample(),
            url: faker.word.sample(),
            stages: [],
            status: RunStatus.InProgress,

        } as IRunProgress;

    });

    it("Should create run progress", async () => {

        //#region ARRANGE

        runMock.stages = [ runStageOneMock ];

        //#endregion

        //#region ACT

        const result = progressMonitor.createRunProgress(runMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.name).to.eq(buildMock.buildNumber);
        chai.expect(result.id).to.eq(buildMock.id);
        chai.expect(result.project).to.eq(projectMock.name);
        chai.expect(result.status).to.eq(RunStatus.InProgress);

        chai.expect(result.stages).to.lengthOf(1);
        chai.expect(result.stages[0].name).to.eq(runStageOneMock.name);
        chai.expect(result.stages[0].id).to.eq(runStageOneMock.id);
        chai.expect(result.stages[0].state).to.eq(TimelineRecordState.Pending);

        //#endregion

    });

    it("Should update run progress (succeeded)", async () => {

        //#region ARRANGE

        buildStageOneMock.state = TimelineRecordState.Completed;
        buildStageOneMock.result = TaskResult.Succeeded;

        runProgressMock.stages = [ buildStageOneMock ];

        //#endregion

        //#region ACT

        const result = progressMonitor.updateRunProgress(runProgressMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.status).to.eq(RunStatus.Succeeded);

        //#endregion

    });

    it("Should update run progress (partially succeeded)", async () => {

        //#region ARRANGE

        buildStageOneMock.state = TimelineRecordState.Completed;
        buildStageOneMock.result = TaskResult.SucceededWithIssues;

        runProgressMock.stages = [ buildStageOneMock ];

        //#endregion

        //#region ACT

        const result = progressMonitor.updateRunProgress(runProgressMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.status).to.eq(RunStatus.PartiallySucceeded);

        //#endregion

    });

    it("Should update run progress (failed)", async () => {

        //#region ARRANGE

        buildStageOneMock.state = TimelineRecordState.Completed;
        buildStageOneMock.result = TaskResult.Failed;

        runProgressMock.stages = [ buildStageOneMock ];

        //#endregion

        //#region ACT

        const result = progressMonitor.updateRunProgress(runProgressMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.status).to.eq(RunStatus.Failed);

        //#endregion

    });

    it("Should update run progress (in progress)", async () => {

        //#region ARRANGE

        buildStageOneMock.state = TimelineRecordState.InProgress;
        buildStageOneMock.result = null;

        runProgressMock.stages = [ buildStageOneMock ];

        //#endregion

        //#region ACT

        const result = progressMonitor.updateRunProgress(runProgressMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.status).to.eq(RunStatus.InProgress);

        //#endregion

    });

    it("Should get active stages", async () => {

        //#region ARRANGE

        buildStageOneMock.state = TimelineRecordState.InProgress;

        runProgressMock.stages = [ buildStageOneMock ];

        //#endregion

        //#region ACT

        const result = progressMonitor.getActiveStages(runProgressMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result).lengthOf(1);
        chai.expect(result[0].state).eq(TimelineRecordState.InProgress);

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
