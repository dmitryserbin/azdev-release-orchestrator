import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";
import faker from "faker";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IProgressMonitor } from "../../workers/progressmonitor/iprogressmonitor";
import { ProgressMonitor } from "../../workers/progressmonitor/progressmonitor";
import { IRun } from "../../workers/runcreator/irun";
import { ISettings } from "../../helpers/taskhelper/isettings";
import { IRunStage } from "../../workers/runcreator/irunstage";
import { RunStatus } from "../../orchestrator/runstatus";

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

        name: faker.random.word(),
        id: faker.random.word(),
        _links: {
            web: {
                href: `https://my.project.uri`
            }
        }

    } as TeamProject;

    const definitionMock = {

        name: faker.random.word(),
        id: faker.datatype.number(),

    } as BuildDefinition;

    const buildMock = {

        buildNumber: faker.random.word(),
        id: faker.datatype.number(),

    } as Build;

    let runMock: IRun;
    let stageOneMock: IRunStage;

    const progressMonitor: IProgressMonitor = new ProgressMonitor(loggerMock.object);

    beforeEach(async () => {

        stageOneMock = {

            name: faker.random.word(),
            id: faker.random.word(),
            target: true,
    
        } as IRunStage;

        runMock = {

            project: projectMock,
            definition: definitionMock,
            build: buildMock,
            stages: [],
            settings: {} as ISettings,
    
        } as IRun;

    });

    it("Should create run progress", async () => {

        //#region ARRANGE

        runMock.stages = [ stageOneMock ];

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
        chai.expect(result.stages[0].name).to.eq(stageOneMock.name);
        chai.expect(result.stages[0].id).to.eq(stageOneMock.id);
        chai.expect(result.stages[0].state).to.eq(TimelineRecordState.Pending);

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
