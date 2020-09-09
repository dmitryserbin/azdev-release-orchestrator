import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ReleaseEnvironment, Release, ApprovalStatus, EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { IMonitor } from "../../interfaces/orchestrator/monitor";
import { Monitor } from "../../orchestrator/monitor";
import { IReleaseJob } from "../../interfaces/common/releasejob";
import { ReleaseStatus } from "../../interfaces/common/releasestatus";
import { IReleaseProgress } from "../../interfaces/common/releaseprogress";
import { IStageProgress } from "../../interfaces/common/stageprogress";

describe("Monitor", ()  => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const projectIdMock: string = "1";
    const projectNameMock: string = "My-Project";
    const projectUrlMock: string = "domain.com";
    const projectLinksMock: unknown = { web: { href: projectUrlMock } };
    const releaseIdMock: number = 1;
    const releaseNameMock: string = "My-Release";
    const releaseStageIdMock: number = 1;
    const releaseStageNameMock: string = "DEV";

    let releaseProgressMock: TypeMoq.IMock<IReleaseProgress>;
    let stageProgressMock: TypeMoq.IMock<IStageProgress>;

    let releaseJobMock: TypeMoq.IMock<IReleaseJob>;
    let projectMock: TypeMoq.IMock<TeamProject>;
    let releaseMock: TypeMoq.IMock<Release>;
    let releaseStageMock: TypeMoq.IMock<ReleaseEnvironment>;

    const progressMonitor: IMonitor = new Monitor(debugCreatorMock.target);

    beforeEach(async () => {

        releaseProgressMock = TypeMoq.Mock.ofType<IReleaseProgress>();
        stageProgressMock = TypeMoq.Mock.ofType<IStageProgress>();

        projectMock = TypeMoq.Mock.ofType<TeamProject>();
        projectMock.setup((x) => x.id).returns(() => projectIdMock);
        projectMock.setup((x) => x.name).returns(() => projectNameMock);
        projectMock.setup((x) => x._links).returns(() => projectLinksMock);

        releaseStageMock = TypeMoq.Mock.ofType<ReleaseEnvironment>();
        releaseStageMock.setup((x) => x.name).returns(() => releaseStageNameMock);
        releaseStageMock.setup((x) => x.id).returns(() => releaseStageIdMock);

        releaseMock = TypeMoq.Mock.ofType<Release>();
        releaseMock.setup((x) => x.name).returns(() => releaseNameMock);
        releaseMock.setup((x) => x.id).returns(() => releaseIdMock);

        releaseJobMock = TypeMoq.Mock.ofType<IReleaseJob>();
        releaseJobMock.target.project = projectMock.target;
        releaseJobMock.target.release = releaseMock.target;

    });

    it("Should create new release progress", async () => {

        //#region ARRANGE

        releaseMock.setup((x) => x.environments).returns(() => [ releaseStageMock.target ]);
        releaseJobMock.target.stages = [ releaseStageNameMock ];

        //#endregion

        //#region ACT

        const result = progressMonitor.createProgress(releaseJobMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.id).to.eq(releaseIdMock);
        chai.expect(result.name).to.eq(releaseNameMock);
        chai.expect(result.project).to.eq(projectNameMock);
        chai.expect(result.url).to.eq(`${projectUrlMock}/_release?releaseId=${releaseIdMock}`);
        chai.expect(result.status).to.eq(ReleaseStatus.InProgress);

        chai.expect(result.stages.length).to.eq(1);
        chai.expect(result.stages[0].name).to.eq(releaseStageNameMock);
        chai.expect(result.stages[0].id).to.eq(releaseStageIdMock);
        chai.expect(result.stages[0].approval.status).to.eq(ApprovalStatus.Pending);
        chai.expect(result.stages[0].status).to.eq(EnvironmentStatus.NotStarted);

        //#endregion

    });

    it("Should update completed release progress", async () => {

        //#region ARRANGE

        stageProgressMock.target.status = EnvironmentStatus.Succeeded;
        releaseProgressMock.target.stages = [ stageProgressMock.target ];

        //#endregion

        //#region ACT

        progressMonitor.updateReleaseProgress(releaseProgressMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(releaseProgressMock.target.status).to.eq(ReleaseStatus.Succeeded);

        //#endregion

    });

    it("Should update failed release progress", async () => {

        //#region ARRANGE

        stageProgressMock.target.status = EnvironmentStatus.Rejected;
        releaseProgressMock.target.stages = [ stageProgressMock.target ];

        //#endregion

        //#region ACT

        progressMonitor.updateReleaseProgress(releaseProgressMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(releaseProgressMock.target.status).to.eq(ReleaseStatus.Failed);

        //#endregion

    });

    it("Should update partially succeeded release progress", async () => {

        //#region ARRANGE

        stageProgressMock.target.status = EnvironmentStatus.PartiallySucceeded;
        releaseProgressMock.target.stages = [ stageProgressMock.target ];

        //#endregion

        //#region ACT

        progressMonitor.updateReleaseProgress(releaseProgressMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(releaseProgressMock.target.status).to.eq(ReleaseStatus.PartiallySucceeded);

        //#endregion

    });

});
