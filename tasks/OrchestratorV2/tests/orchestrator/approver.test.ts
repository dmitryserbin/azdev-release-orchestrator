import "mocha"
import { ApprovalStatus, ReleaseApproval, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { IConsoleLogger } from "../../interfaces/loggers/iconsolelogger"
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger"
import { IReleaseHelper } from "../../interfaces/helpers/ireleasehelper"
import { IDetails } from "../../interfaces/task/idetails"
import { ICommonHelper } from "../../interfaces/helpers/icommonhelper"
import { IApprover } from "../../interfaces/orchestrator/iapprover"
import { IStageProgress } from "../../interfaces/common/istageprogress"
import { ISettings } from "../../interfaces/common/isettings"
import { Approver } from "../../orchestrator/approver"
import { IStageApproval } from "../../interfaces/common/istageapproval"
import assert from "assert"
import { IMock, It, Mock } from "typemoq"

describe("Approver", () => {
	const debugLoggerMock = Mock.ofType<IDebugLogger>()
	const debugCreatorMock = Mock.ofType<IDebugCreator>()
	debugCreatorMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)
	debugLoggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)

	const consoleLoggerMock = Mock.ofType<IConsoleLogger>()
	consoleLoggerMock.setup((x) => x.log(It.isAny())).returns(() => null)
	consoleLoggerMock.setup((x) => x.warn(It.isAny())).returns(() => null)

	const commonHelperMock = Mock.ofType<ICommonHelper>()
	const releaseHelperMock = Mock.ofType<IReleaseHelper>()

	const projectName: string = "My-Project"

	let detailsMock: IMock<IDetails>
	let settingsMock: IMock<ISettings>
	let stageProgressMock: IMock<IStageProgress>
	let stageStatusMock: IMock<ReleaseEnvironment>
	let stageApprovalMock: IMock<IStageApproval>
	let releaseApprovalMock: IMock<ReleaseApproval>

	const releaseApprover: IApprover = new Approver(commonHelperMock.target, releaseHelperMock.target, debugCreatorMock.target, consoleLoggerMock.target)

	beforeEach(async () => {
		detailsMock = Mock.ofType<IDetails>()

		settingsMock = Mock.ofType<ISettings>()
		settingsMock.setup((x) => x.approvalRetry).returns(() => 1)

		stageStatusMock = Mock.ofType<ReleaseEnvironment>()

		stageApprovalMock = Mock.ofType<IStageApproval>()
		stageApprovalMock.target.retry = 0
		stageApprovalMock.target.status = ApprovalStatus.Pending

		stageProgressMock = Mock.ofType<IStageProgress>()
		stageProgressMock.setup((x) => x.name).returns(() => "My-Stage")
		stageProgressMock.setup((x) => x.approval).returns(() => stageApprovalMock.target)

		releaseApprovalMock = Mock.ofType<ReleaseApproval>()

		commonHelperMock.reset()
		releaseHelperMock.reset()
	})

	it("Should successfully approve stage", async () => {
		//#region ARRANGE

		releaseHelperMock
			.setup((x) => x.getStageApprovals(stageStatusMock.target, ApprovalStatus.Pending))
			.returns(() => Promise.resolve([releaseApprovalMock.target]))

		releaseHelperMock
			.setup((x) => x.approveStage(releaseApprovalMock.target, projectName, It.isAnyString()))
			.returns(() => Promise.resolve(releaseApprovalMock.target))

		releaseApprovalMock.setup((x) => x.status).returns(() => ApprovalStatus.Approved)

		//#endregion

		//#region ACT

		await releaseApprover.approveStage(stageProgressMock.target, stageStatusMock.target, projectName, detailsMock.target, settingsMock.target)

		//#endregion

		//#region ASSERT

		assert.equal(stageProgressMock.target.approval.status, ApprovalStatus.Approved, "Approval status should be Approved")

		//#endregion
	})

	it("Should skip stage approval when not required", async () => {
		//#region ARRANGE

		releaseHelperMock
			.setup((x) => x.getStageApprovals(stageStatusMock.target, ApprovalStatus.Pending))
			.returns(() =>
				Promise.resolve([
					/* No pending approvals */
				]),
			)

		//#endregion

		//#region ACT & ASSERT

		await releaseApprover.approveStage(stageProgressMock.target, stageStatusMock.target, projectName, detailsMock.target, settingsMock.target)

		//#endregion

		//#region ASSERT

		assert.equal(stageProgressMock.target.approval.status, ApprovalStatus.Skipped, "Approval status should be Skipped")

		//#endregion
	})

	it("Should cancel stage when approval rejected", async () => {
		//#region ARRANGE

		releaseHelperMock
			.setup((x) => x.getStageApprovals(stageStatusMock.target, ApprovalStatus.Pending))
			.returns(() => Promise.resolve([releaseApprovalMock.target]))

		releaseHelperMock
			.setup((x) => x.approveStage(releaseApprovalMock.target, projectName, It.isAnyString()))
			.returns(() => Promise.resolve(releaseApprovalMock.target))

		releaseApprovalMock.setup((x) => x.status).returns(() => ApprovalStatus.Rejected)

		releaseHelperMock
			.setup((x) => x.cancelStage(stageStatusMock.target, projectName, It.isAnyString()))
			.returns(() => Promise.resolve(stageStatusMock.target))

		//#endregion

		//#region ACT & ASSERT

		await releaseApprover.approveStage(stageProgressMock.target, stageStatusMock.target, projectName, detailsMock.target, settingsMock.target)

		//#endregion

		//#region ASSERT

		assert.equal(stageProgressMock.target.approval.status, ApprovalStatus.Rejected, "Approval status should be Rejected")

		//#endregion
	})
})
