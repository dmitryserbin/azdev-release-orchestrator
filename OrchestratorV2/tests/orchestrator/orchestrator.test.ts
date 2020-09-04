import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IParameters } from "../../interfaces/task/parameters";
import { IDetails } from "../../interfaces/task/details";
import { IOrchestrator } from "../../interfaces/orchestrator/orchestrator";
import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../../interfaces/loggers/consolelogger";
import { Orchestrator } from "../../orchestrator/orchestrator";
import { IOrchestratorFactory } from "../../interfaces/factories/orchestratorfactory";
import { ICreator } from "../../interfaces/orchestrator/creator";
import { IDeployer } from "../../interfaces/orchestrator/deployer";
import { IReporter } from "../../interfaces/orchestrator/reporter";
import { IReleaseJob } from "../../interfaces/common/releasejob";
import { ReleaseType } from "../../interfaces/common/releasetype";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { DeploymentType } from "../../interfaces/common/deploymenttype";
import { IReleaseProgress } from "../../interfaces/common/releaseprogress";

describe("Orchestrator", ()  => {

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

        creatorMock.reset();
        deployerMock.reset();
        reporterMock.reset();

        detailsMock = TypeMoq.Mock.ofType<IDetails>();
        parametersMock = TypeMoq.Mock.ofType<IParameters>();
        releaseJobMock = TypeMoq.Mock.ofType<IReleaseJob>();
        releaseProgressMock = TypeMoq.Mock.ofType<IReleaseProgress>();

    });

    it("Should orchestrate new automated release", async () => {

        parametersMock.target.releaseType = ReleaseType.New;
        releaseJobMock.target.type = DeploymentType.Automated;
        releaseJobMock.target.release = TypeMoq.Mock.ofType<Release>().target;

        creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseJobMock.target));

        deployerMock.setup((x) => x.deployAutomated(releaseJobMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseProgressMock.target));

        const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target);

        chai.expect(result).to.not.eq(null);

    });

    it("Should orchestrate new manual release", async () => {

        parametersMock.target.releaseType = ReleaseType.New;
        releaseJobMock.target.type = DeploymentType.Manual;
        releaseJobMock.target.release = TypeMoq.Mock.ofType<Release>().target;

        creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseJobMock.target));

        deployerMock.setup((x) => x.deployManual(releaseJobMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseProgressMock.target));

        const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target);

        chai.expect(result).to.not.eq(null);

    });

    it("Should orchestrate latest manual release", async () => {

        parametersMock.target.releaseType = ReleaseType.Latest;
        releaseJobMock.target.type = DeploymentType.Manual;
        releaseJobMock.target.release = TypeMoq.Mock.ofType<Release>().target;

        creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseJobMock.target));

        deployerMock.setup((x) => x.deployManual(releaseJobMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseProgressMock.target));

        const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target);

        chai.expect(result).to.not.eq(null);

    });

    it("Should orchestrate specific manual release", async () => {

        parametersMock.target.releaseType = ReleaseType.Specific;
        releaseJobMock.target.type = DeploymentType.Manual;
        releaseJobMock.target.release = TypeMoq.Mock.ofType<Release>().target;

        creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseJobMock.target));

        deployerMock.setup((x) => x.deployManual(releaseJobMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseProgressMock.target));

        const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target);

        chai.expect(result).to.not.eq(null);

    });

});
