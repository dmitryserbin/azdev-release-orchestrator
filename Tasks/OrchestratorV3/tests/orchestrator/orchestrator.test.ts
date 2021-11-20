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

    let parametersMock: TypeMoq.IMock<IParameters>;
    let runMock: TypeMoq.IMock<IRun>;
    let runProgressMock: TypeMoq.IMock<IRunProgress>;

    const orchestrator: IOrchestrator = new Orchestrator(runCreatorMock.object, runDeployerMock.object, progressReporterMock.object, loggerMock.object);

    beforeEach(async () => {

        runCreatorMock.reset();
        runDeployerMock.reset();
        progressReporterMock.reset();

        parametersMock = TypeMoq.Mock.ofType<IParameters>();
        parametersMock.target.projectName = faker.random.word();
        parametersMock.target.definitionName = faker.random.word();

        runMock = TypeMoq.Mock.ofType<IRun>();
        runMock.target.project = TypeMoq.It.isAny();
        runMock.target.definition = TypeMoq.It.isAny();
        runMock.target.build = TypeMoq.It.isAny();

        runProgressMock = TypeMoq.Mock.ofType<IRunProgress>();

        progressReporterMock
            .setup((x) => x.logRun(TypeMoq.It.isAny()))
            .returns(() => null);

        progressReporterMock
            .setup((x) => x.logRunProgress(TypeMoq.It.isAny()))
            .returns(() => null);

    });

    it("Should orchestrate new run", async () => {

        //#region ARRANGE

        parametersMock.target.strategy = Strategy.New;

        runCreatorMock
            .setup((x) => x.create(parametersMock.target))
            .returns(() => Promise.resolve(runMock.target))
            .verifiable(TypeMoq.Times.once());

        runDeployerMock
            .setup((x) => x.deployAutomated(runMock.target))
            .returns(() => Promise.resolve(runProgressMock.target))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        runCreatorMock.verifyAll();
        runDeployerMock.verifyAll();

        //#endregion

    });

    it("Should orchestrate latest run", async () => {

        //#region ARRANGE

        parametersMock.target.strategy = Strategy.Latest;

        runCreatorMock
            .setup((x) => x.create(parametersMock.target))
            .returns(() => Promise.resolve(runMock.target))
            .verifiable(TypeMoq.Times.once());

        runDeployerMock
            .setup((x) => x.deployManual(runMock.target))
            .returns(() => Promise.resolve(runProgressMock.target))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        runCreatorMock.verifyAll();
        runDeployerMock.verifyAll();

        //#endregion

    });

    it("Should orchestrate specific run", async () => {

        //#region ARRANGE

        parametersMock.target.strategy = Strategy.Specific;

        runCreatorMock
            .setup((x) => x.create(parametersMock.target))
            .returns(() => Promise.resolve(runMock.target))
            .verifiable(TypeMoq.Times.once());

        runDeployerMock
            .setup((x) => x.deployManual(runMock.target))
            .returns(() => Promise.resolve(runProgressMock.target))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target);

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
