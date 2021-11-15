import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IWorkerFactory } from "../../factories/workerfactory/iworkerfactory";
import { IRunCreator } from "../../workers/runcreator/iruncreator";
import { IRunDeployer } from "../../workers/rundeployer/irundeployer";
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter";
import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IRun } from "../../workers/runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { IOrchestrator } from "../../orchestrator/iorchestrator";
import { Orchestrator } from "../../orchestrator/orchestrator";
import { Strategy } from "../../helpers/taskhelper/strategy";

describe("Orchestrator", ()  => {

    const loggerMock = TypeMoq.Mock.ofType<ILogger>();
    const debugMock = TypeMoq.Mock.ofType<IDebug>();

    loggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);
    loggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugMock.target);
    debugMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugMock.target);

    const runCreatorMock = TypeMoq.Mock.ofType<IRunCreator>();
    const runDeployerMock = TypeMoq.Mock.ofType<IRunDeployer>();

    const progressReporterMock = TypeMoq.Mock.ofType<IProgressReporter>();
    progressReporterMock.setup((x) => x.logRun(TypeMoq.It.isAny())).returns(() => null);
    progressReporterMock.setup((x) => x.logRunProgress(TypeMoq.It.isAny())).returns(() => null);

    const workerFactoryMock = TypeMoq.Mock.ofType<IWorkerFactory>();
    workerFactoryMock.setup((x) => x.createRunCreator()).returns(() => Promise.resolve(runCreatorMock.target));
    workerFactoryMock.setup((x) => x.createRunDeployer()).returns(() => Promise.resolve(runDeployerMock.target));
    workerFactoryMock.setup((x) => x.createProgressReporter()).returns(() => Promise.resolve(progressReporterMock.target));

    let parametersMock: TypeMoq.IMock<IParameters>;
    let runMock: TypeMoq.IMock<IRun>;
    let runProgressMock: TypeMoq.IMock<IRunProgress>;

    const orchestrator: IOrchestrator = new Orchestrator(workerFactoryMock.target, loggerMock.target);

    beforeEach(async () => {

        parametersMock = TypeMoq.Mock.ofType<IParameters>();
        parametersMock.target.projectName = TypeMoq.It.isAnyString();
        parametersMock.target.definitionName = TypeMoq.It.isAnyString();

        runMock = TypeMoq.Mock.ofType<IRun>();
        runMock.target.project = TypeMoq.It.isAny();
        runMock.target.definition = TypeMoq.It.isAny();
        runMock.target.build = TypeMoq.It.isAny();

        runProgressMock = TypeMoq.Mock.ofType<IRunProgress>();

        runCreatorMock.reset();
        runDeployerMock.reset();
        progressReporterMock.reset();

    });

    it("Should orchestrate new run", async () => {

        //#region ARRANGE

        parametersMock.target.strategy = Strategy.New;

        runCreatorMock.setup((x) => x.create(parametersMock.target)).returns(() => Promise.resolve(runMock.target));
        runDeployerMock.setup((x) => x.deployAutomated(runMock.target)).returns(() => Promise.resolve(runProgressMock.target));

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

    it("Should orchestrate latest run", async () => {

        //#region ARRANGE

        parametersMock.target.strategy = Strategy.Latest;

        runCreatorMock.setup((x) => x.create(parametersMock.target)).returns(() => Promise.resolve(runMock.target));
        runDeployerMock.setup((x) => x.deployManual(runMock.target)).returns(() => Promise.resolve(runProgressMock.target));

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

    it("Should orchestrate specific run", async () => {

        //#region ARRANGE

        parametersMock.target.strategy = Strategy.Specific;

        runCreatorMock.setup((x) => x.create(parametersMock.target)).returns(() => Promise.resolve(runMock.target));
        runDeployerMock.setup((x) => x.deployManual(runMock.target)).returns(() => Promise.resolve(runProgressMock.target));

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

});
