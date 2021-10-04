import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { ReleaseEnvironment, ApprovalStatus, ReleaseApproval } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../../interfaces/loggers/consolelogger";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { IReleaseHelper } from "../../interfaces/helpers/releasehelper";
import { IDetails } from "../../interfaces/task/details";
import { ICommonHelper } from "../../interfaces/helpers/commonhelper";
import { IApprover } from "../../interfaces/orchestrator/approver";
import { IStageProgress } from "../../interfaces/common/stageprogress";
import { ISettings } from "../../interfaces/common/settings";
import { Approver } from "../../orchestrator/approver";
import { IStageApproval } from "../../interfaces/common/stageapproval";

describe("Approver", ()  => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
    consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);
    consoleLoggerMock.setup((x) => x.warn(TypeMoq.It.isAny())).returns(() => null);

    const commonHelperMock = TypeMoq.Mock.ofType<ICommonHelper>();
    const releaseHelperMock = TypeMoq.Mock.ofType<IReleaseHelper>();

    const projectName: string = "My-Project";

    let detailsMock: TypeMoq.IMock<IDetails>;
    let settingsMock: TypeMoq.IMock<ISettings>;
    let stageProgressMock: TypeMoq.IMock<IStageProgress>;
    let stageStatusMock: TypeMoq.IMock<ReleaseEnvironment>;
    let stageApprovalMock: TypeMoq.IMock<IStageApproval>;
    let releaseApprovalMock: TypeMoq.IMock<ReleaseApproval>;

    const releaseApprover: IApprover = new Approver(commonHelperMock.target, releaseHelperMock.target, debugCreatorMock.target, consoleLoggerMock.target);

    beforeEach(async () => {

        detailsMock = TypeMoq.Mock.ofType<IDetails>();

        settingsMock = TypeMoq.Mock.ofType<ISettings>();
        settingsMock.setup((x) => x.approvalRetry).returns(() => 1);

        stageStatusMock = TypeMoq.Mock.ofType<ReleaseEnvironment>();

        stageApprovalMock = TypeMoq.Mock.ofType<IStageApproval>();
        stageApprovalMock.target.retry = 0;
        stageApprovalMock.target.status = ApprovalStatus.Pending;

        stageProgressMock = TypeMoq.Mock.ofType<IStageProgress>();
        stageProgressMock.setup((x) => x.name).returns(() => "My-Stage");
        stageProgressMock.setup((x) => x.approval).returns(() => stageApprovalMock.target);

        releaseApprovalMock = TypeMoq.Mock.ofType<ReleaseApproval>();

        commonHelperMock.reset();
        releaseHelperMock.reset();

    });

    it("Should successfully approve stage", async () => {

        //#region ARRANGE

        releaseHelperMock.setup((x) => x.getStageApprovals(stageStatusMock.target, ApprovalStatus.Pending)).returns(
            () => Promise.resolve([ releaseApprovalMock.target ]));

        releaseHelperMock.setup((x) => x.approveStage(releaseApprovalMock.target, projectName, TypeMoq.It.isAnyString())).returns(
            () => Promise.resolve(releaseApprovalMock.target));

        releaseApprovalMock.setup((x) => x.status).returns(
            () => ApprovalStatus.Approved);

        //#endregion

        //#region ACT

        await releaseApprover.approveStage(stageProgressMock.target, stageStatusMock.target, projectName, detailsMock.target, settingsMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(stageProgressMock.target.approval.status).to.eq(ApprovalStatus.Approved);

        //#endregion

    });

    it("Should skip stage approval when not required", async () => {

        //#region ARRANGE

        releaseHelperMock.setup((x) => x.getStageApprovals(stageStatusMock.target, ApprovalStatus.Pending)).returns(
            () => Promise.resolve([ /* No pending approvals */ ]));

        //#endregion

        //#region ACT & ASSERT

        await releaseApprover.approveStage(stageProgressMock.target, stageStatusMock.target, projectName, detailsMock.target, settingsMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(stageProgressMock.target.approval.status).to.eq(ApprovalStatus.Skipped);

        //#endregion

    });

    it("Should cancel stage when approval rejected", async () => {

        //#region ARRANGE

        releaseHelperMock.setup((x) => x.getStageApprovals(stageStatusMock.target, ApprovalStatus.Pending)).returns(
            () => Promise.resolve([ releaseApprovalMock.target ]));

        releaseHelperMock.setup((x) => x.approveStage(releaseApprovalMock.target, projectName, TypeMoq.It.isAnyString())).returns(
            () => Promise.resolve(releaseApprovalMock.target));

        releaseApprovalMock.setup((x) => x.status).returns(
            () => ApprovalStatus.Rejected);

        releaseHelperMock.setup((x) => x.cancelStage(stageStatusMock.target, projectName, TypeMoq.It.isAnyString())).returns(
            () => Promise.resolve(stageStatusMock.target));

        //#endregion

        //#region ACT & ASSERT

        await releaseApprover.approveStage(stageProgressMock.target, stageStatusMock.target, projectName, detailsMock.target, settingsMock.target);

        //#endregion

        //#region ASSERT

        chai.expect(stageProgressMock.target.approval.status).to.eq(ApprovalStatus.Rejected);

        //#endregion

    });

});
