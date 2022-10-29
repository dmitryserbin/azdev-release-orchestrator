import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IParameters } from "../../interfaces/task/iparameters";
import { IDetails } from "../../interfaces/task/idetails";
import { IOrchestrator } from "../../interfaces/orchestrator/iorchestrator";
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator";
import { IConsoleLogger } from "../../interfaces/loggers/iconsolelogger";
import { Orchestrator } from "../../orchestrator/orchestrator";
import { IOrchestratorFactory } from "../../interfaces/factories/iorchestratorfactory";
import { ICreator } from "../../interfaces/orchestrator/icreator";
import { IDeployer } from "../../interfaces/orchestrator/ideployer";
import { IReporter } from "../../interfaces/orchestrator/ireporter";
import { IReleaseJob } from "../../interfaces/common/ireleasejob";
import { ReleaseType } from "../../interfaces/common/ireleasetype";
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger";
import { DeploymentType } from "../../interfaces/common/ideploymenttype";
import { IReleaseProgress } from "../../interfaces/common/ireleaseprogress";

describe("Orchestrator", () => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
    consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);

    const creatorMock = TypeMoq.Mock.ofType<ICreator>();
    const deployerMock = TypeMoq.Mock.ofType<IDeployer>();

    const reporterMock = TypeMoq.Mock.ofType<IReporter>();
    reporterMock.setup((x) => x.getRelease(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => "");
    reporterMock.setup((x) => x.getReleaseProgress(TypeMoq.It.isAny())).returns(() => "");

    const orchestratorFactoryMock = TypeMoq.Mock.ofType<IOrchestratorFactory>();
    orchestratorFactoryMock.setup((x) => x.createCreator()).returns(() => Promise.resolve(creatorMock.target));
    orchestratorFactoryMock.setup((x) => x.createDeployer()).returns(() => Promise.resolve(deployerMock.target));
    orchestratorFactoryMock.setup((x) => x.createReporter()).returns(() => Promise.resolve(reporterMock.target));

    let detailsMock: TypeMoq.IMock<IDetails>;
    let parametersMock: TypeMoq.IMock<IParameters>;
    let releaseJobMock: TypeMoq.IMock<IReleaseJob>;
    let releaseProgressMock: TypeMoq.IMock<IReleaseProgress>;

    const orchestrator: IOrchestrator = new Orchestrator(orchestratorFactoryMock.target, debugCreatorMock.target, consoleLoggerMock.target);

    beforeEach(async () => {

        detailsMock = TypeMoq.Mock.ofType<IDetails>();
        parametersMock = TypeMoq.Mock.ofType<IParameters>();
        releaseJobMock = TypeMoq.Mock.ofType<IReleaseJob>();
        releaseProgressMock = TypeMoq.Mock.ofType<IReleaseProgress>();

        creatorMock.reset();
        deployerMock.reset();
        reporterMock.reset();

    });

    it("Should orchestrate new automated release", async () => {

        //#region ARRANGE

        parametersMock.target.releaseType = ReleaseType.New;
        releaseJobMock.target.type = DeploymentType.Automated;
        releaseJobMock.target.release = TypeMoq.Mock.ofType<Release>().target;

        creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseJobMock.target));

        deployerMock.setup((x) => x.deployAutomated(releaseJobMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseProgressMock.target));

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

    it("Should orchestrate new manual release", async () => {

        //#region ARRANGE

        parametersMock.target.releaseType = ReleaseType.New;
        releaseJobMock.target.type = DeploymentType.Manual;
        releaseJobMock.target.release = TypeMoq.Mock.ofType<Release>().target;

        creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseJobMock.target));

        deployerMock.setup((x) => x.deployManual(releaseJobMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseProgressMock.target));

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

    it("Should orchestrate latest manual release", async () => {

        //#region ARRANGE

        parametersMock.target.releaseType = ReleaseType.Latest;
        releaseJobMock.target.type = DeploymentType.Manual;
        releaseJobMock.target.release = TypeMoq.Mock.ofType<Release>().target;

        creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseJobMock.target));

        deployerMock.setup((x) => x.deployManual(releaseJobMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseProgressMock.target));

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

    it("Should orchestrate specific manual release", async () => {

        //#region ARRANGE

        parametersMock.target.releaseType = ReleaseType.Specific;
        releaseJobMock.target.type = DeploymentType.Manual;
        releaseJobMock.target.release = TypeMoq.Mock.ofType<Release>().target;

        creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseJobMock.target));

        deployerMock.setup((x) => x.deployManual(releaseJobMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseProgressMock.target));

        //#endregion

        //#region ACT

        const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

});
