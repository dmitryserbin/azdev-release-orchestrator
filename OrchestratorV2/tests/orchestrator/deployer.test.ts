import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Release, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../../interfaces/loggers/consolelogger";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { IReleaseHelper } from "../../interfaces/helpers/releasehelper";
import { IDetails } from "../../interfaces/task/details";
import { IReleaseJob } from "../../interfaces/common/releasejob";
import { ICommonHelper } from "../../interfaces/helpers/commonhelper";
import { IApprover } from "../../interfaces/orchestrator/approver";
import { IMonitor } from "../../interfaces/orchestrator/monitor";
import { IReporter } from "../../interfaces/orchestrator/reporter";
import { IDeployer } from "../../interfaces/orchestrator/deployer";
import { Deployer } from "../../orchestrator/deployer";
import { IReleaseProgress } from "../../interfaces/common/releaseprogress";
import { IStageProgress } from "../../interfaces/common/stageprogress";
import { ReleaseStatus } from "../../interfaces/common/releasestatus";
import { ISettings } from "../../interfaces/common/settings";

describe("Deployer", ()  => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
    consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);

    const commonHelperMock = TypeMoq.Mock.ofType<ICommonHelper>();
    const releaseHelperMock = TypeMoq.Mock.ofType<IReleaseHelper>();
    const releaseApproverMock = TypeMoq.Mock.ofType<IApprover>();
    const progressMonitorMock = TypeMoq.Mock.ofType<IMonitor>();

    const progressReporterMock = TypeMoq.Mock.ofType<IReporter>();
    progressReporterMock.setup((x) => x.getStageProgress(TypeMoq.It.isAny())).returns(() => "");
    progressReporterMock.setup((x) => x.getStagesProgress(TypeMoq.It.isAny())).returns(() => "");

    let detailsMock: TypeMoq.IMock<IDetails>;
    let releaseJobMock: TypeMoq.IMock<IReleaseJob>;
    let settingsMock: TypeMoq.IMock<ISettings>;
    let projectMock: TypeMoq.IMock<TeamProject>;
    let releaseMock: TypeMoq.IMock<Release>;
    let releaseProgressMock: TypeMoq.IMock<IReleaseProgress>;
    let releaseStatusMock: TypeMoq.IMock<Release>;
    let stageOneProgress: TypeMoq.IMock<IStageProgress>;
    let stageTwoProgress: TypeMoq.IMock<IStageProgress>;

    const deployer: IDeployer = new Deployer(commonHelperMock.target, releaseHelperMock.target, releaseApproverMock.target, progressMonitorMock.target, progressReporterMock.target, debugCreatorMock.target, consoleLoggerMock.target);

    beforeEach(async () => {

        detailsMock = TypeMoq.Mock.ofType<IDetails>();
        releaseJobMock = TypeMoq.Mock.ofType<IReleaseJob>();
        settingsMock = TypeMoq.Mock.ofType<ISettings>();

        projectMock = TypeMoq.Mock.ofType<TeamProject>();
        projectMock.target.id = "1";

        releaseMock = TypeMoq.Mock.ofType<Release>();
        releaseMock.target.id = 1;

        releaseProgressMock = TypeMoq.Mock.ofType<IReleaseProgress>();
        releaseStatusMock = TypeMoq.Mock.ofType<Release>();

        stageOneProgress = TypeMoq.Mock.ofType<IStageProgress>();
        stageOneProgress.setup((x) => x.name).returns(() => "My-Stage-One")

        stageTwoProgress = TypeMoq.Mock.ofType<IStageProgress>();
        stageTwoProgress.setup((x) => x.name).returns(() => "My-Stage-Two")

        releaseJobMock.target.settings = settingsMock.target;
        releaseJobMock.target.project = projectMock.target;
        releaseJobMock.target.release = releaseMock.target;

        commonHelperMock.reset();
        releaseHelperMock.reset();
        releaseApproverMock.reset();
        progressMonitorMock.reset();
        progressReporterMock.reset();

    });

    it("Should deploy manual release", async () => {

        //#region ARRANGE

        releaseProgressMock.setup((x) => x.stages).returns(
            () => [ stageOneProgress.target, stageTwoProgress.target ]);

        progressMonitorMock.setup((x) => x.createProgress(releaseJobMock.target)).returns(
            () => releaseProgressMock.target);

        progressMonitorMock.setup((x) => x.getPendingStages(releaseProgressMock.target)).returns(
            () => [ stageOneProgress.target ]);

        // STAGE >>

        const stageStatusMock = TypeMoq.Mock.ofType<ReleaseEnvironment>();

        releaseHelperMock.setup((x) => x.getReleaseStatus(releaseJobMock.target.project.name!, releaseJobMock.target.release.id!)).returns(
            () => Promise.resolve(releaseStatusMock.target));

        releaseHelperMock.setup((x) => x.getStageStatus(releaseStatusMock.target, stageOneProgress.target.name)).returns(
            () => Promise.resolve(stageStatusMock.target));

        progressMonitorMock.setup((x) => x.updateStageProgress(stageOneProgress.target, stageStatusMock.target)).returns(
            () => null);

        progressMonitorMock.setup((x) => x.isStagePending(stageOneProgress.target)).returns(
            () => true);

        releaseHelperMock.setup((x) => x.startStage(stageStatusMock.target, releaseJobMock.target.project.name!, TypeMoq.It.isAnyString())).returns(
            () => Promise.resolve(stageStatusMock.target));

        progressMonitorMock.setup((x) => x.updateStageProgress(stageOneProgress.target, stageStatusMock.target)).returns(
            () => null);

        progressMonitorMock.setup((x) => x.isStageCompleted(stageOneProgress.target)).returns(
            () => false);

        // << STAGE

        // MONITOR >>

        releaseHelperMock.setup((x) => x.getReleaseStatus(releaseJobMock.target.project.name!, releaseJobMock.target.release.id!)).returns(
            () => Promise.resolve(releaseStatusMock.target));

        releaseHelperMock.setup((x) => x.getStageStatus(releaseStatusMock.target, stageOneProgress.target.name)).returns(
            () => Promise.resolve(stageStatusMock.target));

        releaseApproverMock.setup((x) => x.isStageApproved(stageOneProgress.target, stageStatusMock.target)).returns(
            () => Promise.resolve(false));

        releaseApproverMock.setup((x) => x.approveStage(stageOneProgress.target, stageStatusMock.target, releaseJobMock.target.project.name!, detailsMock.target, releaseJobMock.target.settings)).returns(
            () => Promise.resolve());

        progressMonitorMock.setup((x) => x.updateStageProgress(stageOneProgress.target, stageStatusMock.target)).returns(
            () => null);

        progressMonitorMock.setup((x) => x.updateReleaseProgress(releaseProgressMock.target)).returns(
            () => null);

        releaseProgressMock.setup((x) => x.status).returns(
            () => ReleaseStatus.Succeeded);

        progressMonitorMock.setup((x) => x.isStageCompleted(stageOneProgress.target)).returns(
            () => true);

        // << MONITOR

        //#endregion

        //#region ACT

        const result = await deployer.deployManual(releaseJobMock.target, detailsMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.status).to.eq(ReleaseStatus.Succeeded);

        //#endregion

    });

    it("Should deploy automated release", async () => {

        //#region ARRANGE

        releaseProgressMock.setup((x) => x.stages).returns(
            () => [ stageOneProgress.target, stageTwoProgress.target ]);

        progressMonitorMock.setup((x) => x.createProgress(releaseJobMock.target)).returns(
            () => releaseProgressMock.target);

        releaseHelperMock.setup((x) => x.getReleaseStatus(releaseJobMock.target.project.name!, releaseJobMock.target.release.id!)).returns(
            () => Promise.resolve(releaseStatusMock.target));

        progressMonitorMock.setup((x) => x.getActiveStages(releaseProgressMock.target)).returns(
            () => [ stageOneProgress.target ]);

        // STAGE >>

        const stageStatusMock = TypeMoq.Mock.ofType<ReleaseEnvironment>();

        releaseHelperMock.setup((x) => x.getStageStatus(releaseStatusMock.target, stageOneProgress.target.name)).returns(
            () => Promise.resolve(stageStatusMock.target));

        releaseApproverMock.setup((x) => x.isStageApproved(stageOneProgress.target, stageStatusMock.target)).returns(
            () => Promise.resolve(false));

        releaseApproverMock.setup((x) => x.approveStage(stageOneProgress.target, stageStatusMock.target, releaseJobMock.target.project.name!, detailsMock.target, releaseJobMock.target.settings)).returns(
            () => Promise.resolve());

        progressMonitorMock.setup((x) => x.updateStageProgress(stageOneProgress.target, stageStatusMock.target)).returns(
            () => null);

        progressMonitorMock.setup((x) => x.isStageCompleted(stageOneProgress.target)).returns(
            () => true);  

        // << STAGE

        progressMonitorMock.setup((x) => x.updateReleaseProgress(releaseProgressMock.target)).returns(
            () => null);

        releaseProgressMock.setup((x) => x.status).returns(
            () => ReleaseStatus.InProgress);

        commonHelperMock.setup((x) => x.wait(releaseJobMock.target.settings.sleep)).returns(
            () => Promise.resolve());

        releaseProgressMock.setup((x) => x.status).returns(
            () => ReleaseStatus.Succeeded);

        //#endregion

        //#region ACT

        const result = await deployer.deployAutomated(releaseJobMock.target, detailsMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.status).to.eq(ReleaseStatus.Succeeded);

        //#endregion

    });

});
