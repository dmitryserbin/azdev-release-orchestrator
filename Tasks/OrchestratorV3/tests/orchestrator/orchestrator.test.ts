import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";
import * as faker from "faker";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IRunCreator } from "../../workers/runcreator/iruncreator";
import { IRunDeployer } from "../../workers/rundeployer/irundeployer";
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter";
import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IRun } from "../../workers/runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { IOrchestrator } from "../../orchestrator/iorchestrator";
import { Orchestrator } from "../../orchestrator/orchestrator";
import { Strategy } from "../../helpers/taskhelper/strategy";

describe("Orchestrator", async () => {

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

    const runCreatorMock = TypeMoq.Mock.ofType<IRunCreator>();
    const runDeployerMock = TypeMoq.Mock.ofType<IRunDeployer>();
    const progressReporterMock = TypeMoq.Mock.ofType<IProgressReporter>();

    const parametersMock = {

        projectName: faker.random.word(),
        definitionName: faker.random.word(),

    } as IParameters;

    const runMock = {

        project: TypeMoq.It.isAny(),
        definition: TypeMoq.It.isAny(),
        build: TypeMoq.It.isAny(),

    } as IRun;

    const runProgressMock = {

        id: faker.datatype.number(),

    } as IRunProgress;

    const orchestrator: IOrchestrator = new Orchestrator(runCreatorMock.object, runDeployerMock.object, progressReporterMock.object, loggerMock.object);

    beforeEach(async () => {

        runCreatorMock.reset();
        runDeployerMock.reset();
        progressReporterMock.reset();

        progressReporterMock
            .setup((x) => x.logRun(TypeMoq.It.isAny()))
            .returns(() => null);

        progressReporterMock
            .setup((x) => x.logRunProgress(TypeMoq.It.isAny()))
            .returns(() => null);

    });

    it("Should orchestrate new run", async () => {

        //#region ARRANGE

        parametersMock.strategy = Strategy.New;

        runCreatorMock
            .setup((x) => x.create(parametersMock))
            .returns(() => Promise.resolve(runMock))
            .verifiable(TypeMoq.Times.once());

        runDeployerMock
            .setup((x) => x.deployAutomated(runMock))
            .returns(() => Promise.resolve(runProgressMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        runCreatorMock.verifyAll();
        runDeployerMock.verifyAll();

        //#endregion

    });

    it("Should orchestrate latest run", async () => {

        //#region ARRANGE

        parametersMock.strategy = Strategy.Latest;

        runCreatorMock
            .setup((x) => x.create(parametersMock))
            .returns(() => Promise.resolve(runMock))
            .verifiable(TypeMoq.Times.once());

        runDeployerMock
            .setup((x) => x.deployManual(runMock))
            .returns(() => Promise.resolve(runProgressMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        runCreatorMock.verifyAll();
        runDeployerMock.verifyAll();

        //#endregion

    });

    it("Should orchestrate specific run", async () => {

        //#region ARRANGE

        parametersMock.strategy = Strategy.Specific;

        runCreatorMock
            .setup((x) => x.create(parametersMock))
            .returns(() => Promise.resolve(runMock))
            .verifiable(TypeMoq.Times.once());

        runDeployerMock
            .setup((x) => x.deployManual(runMock))
            .returns(() => Promise.resolve(runProgressMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        runCreatorMock.verifyAll();
        runDeployerMock.verifyAll();

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
