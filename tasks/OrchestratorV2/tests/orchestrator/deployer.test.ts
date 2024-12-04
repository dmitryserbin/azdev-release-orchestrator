import "mocha"
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces"
import { Release, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { IConsoleLogger } from "../../interfaces/loggers/iconsolelogger"
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger"
import { IReleaseHelper } from "../../interfaces/helpers/ireleasehelper"
import { IDetails } from "../../interfaces/task/idetails"
import { IReleaseJob } from "../../interfaces/common/ireleasejob"
import { ICommonHelper } from "../../interfaces/helpers/icommonhelper"
import { IApprover } from "../../interfaces/orchestrator/iapprover"
import { IMonitor } from "../../interfaces/orchestrator/imonitor"
import { IReporter } from "../../interfaces/orchestrator/ireporter"
import { IDeployer } from "../../interfaces/orchestrator/ideployer"
import { Deployer } from "../../orchestrator/deployer"
import { IReleaseProgress } from "../../interfaces/common/ireleaseprogress"
import { IStageProgress } from "../../interfaces/common/istageprogress"
import { ReleaseStatus } from "../../interfaces/common/ireleasestatus"
import { ISettings } from "../../interfaces/common/isettings"
import assert from "assert"
import { Mock, It, IMock } from "typemoq"

describe("Deployer", () => {
	const debugLoggerMock = Mock.ofType<IDebugLogger>()
	const debugCreatorMock = Mock.ofType<IDebugCreator>()
	debugCreatorMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)
	debugLoggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)

	const consoleLoggerMock = Mock.ofType<IConsoleLogger>()
	consoleLoggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	const commonHelperMock = Mock.ofType<ICommonHelper>()
	const releaseHelperMock = Mock.ofType<IReleaseHelper>()
	const releaseApproverMock = Mock.ofType<IApprover>()
	const progressMonitorMock = Mock.ofType<IMonitor>()

	const progressReporterMock = Mock.ofType<IReporter>()
	progressReporterMock.setup((x) => x.getStageProgress(It.isAny())).returns(() => "")
	progressReporterMock.setup((x) => x.getStagesProgress(It.isAny())).returns(() => "")

	let detailsMock: IMock<IDetails>
	let releaseJobMock: IMock<IReleaseJob>
	let settingsMock: IMock<ISettings>
	let projectMock: IMock<TeamProject>
	let releaseMock: IMock<Release>
	let releaseProgressMock: IMock<IReleaseProgress>
	let releaseStatusMock: IMock<Release>
	let stageOneProgress: IMock<IStageProgress>
	let stageTwoProgress: IMock<IStageProgress>

	const deployer: IDeployer = new Deployer(
		commonHelperMock.target,
		releaseHelperMock.target,
		releaseApproverMock.target,
		progressMonitorMock.target,
		progressReporterMock.target,
		debugCreatorMock.target,
		consoleLoggerMock.target,
	)

	beforeEach(async () => {
		detailsMock = Mock.ofType<IDetails>()
		releaseJobMock = Mock.ofType<IReleaseJob>()
		settingsMock = Mock.ofType<ISettings>()

		projectMock = Mock.ofType<TeamProject>()
		projectMock.target.id = "1"

		releaseMock = Mock.ofType<Release>()
		releaseMock.target.id = 1

		releaseProgressMock = Mock.ofType<IReleaseProgress>()
		releaseStatusMock = Mock.ofType<Release>()

		stageOneProgress = Mock.ofType<IStageProgress>()
		stageOneProgress.setup((x) => x.name).returns(() => "My-Stage-One")

		stageTwoProgress = Mock.ofType<IStageProgress>()
		stageTwoProgress.setup((x) => x.name).returns(() => "My-Stage-Two")

		releaseJobMock.target.settings = settingsMock.target
		releaseJobMock.target.project = projectMock.target
		releaseJobMock.target.release = releaseMock.target

		commonHelperMock.reset()
		releaseHelperMock.reset()
		releaseApproverMock.reset()
		progressMonitorMock.reset()
		progressReporterMock.reset()
	})

	it("Should deploy manual release", async () => {
		//#region ARRANGE

		releaseProgressMock.setup((x) => x.stages).returns(() => [stageOneProgress.target, stageTwoProgress.target])

		progressMonitorMock.setup((x) => x.createProgress(releaseJobMock.target)).returns(() => releaseProgressMock.target)

		progressMonitorMock.setup((x) => x.getPendingStages(releaseProgressMock.target)).returns(() => [stageOneProgress.target])

		//#region STAGE

		const stageStatusMock = Mock.ofType<ReleaseEnvironment>()

		releaseHelperMock
			.setup((x) => x.getReleaseStatus(releaseJobMock.target.project.name!, releaseJobMock.target.release.id!))
			.returns(() => Promise.resolve(releaseStatusMock.target))

		releaseHelperMock
			.setup((x) => x.getStageStatus(releaseStatusMock.target, stageOneProgress.target.name))
			.returns(() => Promise.resolve(stageStatusMock.target))

		progressMonitorMock.setup((x) => x.updateStageProgress(stageOneProgress.target, stageStatusMock.target)).returns(() => null)

		progressMonitorMock.setup((x) => x.isStagePending(stageOneProgress.target)).returns(() => true)

		//#region START

		releaseHelperMock
			.setup((x) => x.startStage(stageStatusMock.target, releaseJobMock.target.project.name!, It.isAnyString()))
			.returns(() => Promise.resolve(stageStatusMock.target))

		progressMonitorMock.setup((x) => x.updateStageProgress(stageOneProgress.target, stageStatusMock.target)).returns(() => null)

		//#endregion

		progressMonitorMock.setup((x) => x.isStageCompleted(stageOneProgress.target)).returns(() => false)

		//#region MONITOR

		releaseHelperMock
			.setup((x) => x.getReleaseStatus(releaseJobMock.target.project.name!, releaseJobMock.target.release.id!))
			.returns(() => Promise.resolve(releaseStatusMock.target))

		releaseHelperMock
			.setup((x) => x.getStageStatus(releaseStatusMock.target, stageOneProgress.target.name))
			.returns(() => Promise.resolve(stageStatusMock.target))

		releaseApproverMock.setup((x) => x.isStageApproved(stageOneProgress.target, stageStatusMock.target)).returns(() => Promise.resolve(false))

		releaseApproverMock
			.setup((x) =>
				x.approveStage(
					stageOneProgress.target,
					stageStatusMock.target,
					releaseJobMock.target.project.name!,
					detailsMock.target,
					releaseJobMock.target.settings,
				),
			)
			.returns(() => Promise.resolve())

		progressMonitorMock.setup((x) => x.updateStageProgress(stageOneProgress.target, stageStatusMock.target)).returns(() => null)

		progressMonitorMock.setup((x) => x.updateReleaseProgress(releaseProgressMock.target)).returns(() => null)

		releaseProgressMock.setup((x) => x.status).returns(() => ReleaseStatus.Succeeded)

		progressMonitorMock.setup((x) => x.isStageCompleted(stageOneProgress.target)).returns(() => true)

		//#endregion

		//#endregion

		//#endregion

		//#region ACT

		const result = await deployer.deployManual(releaseJobMock.target, detailsMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.status, ReleaseStatus.Succeeded, "Release status should be Succeeded")

		//#endregion
	})

	it("Should deploy automated release", async () => {
		//#region ARRANGE

		releaseProgressMock.setup((x) => x.stages).returns(() => [stageOneProgress.target, stageTwoProgress.target])

		progressMonitorMock.setup((x) => x.createProgress(releaseJobMock.target)).returns(() => releaseProgressMock.target)

		releaseHelperMock
			.setup((x) => x.getReleaseStatus(releaseJobMock.target.project.name!, releaseJobMock.target.release.id!))
			.returns(() => Promise.resolve(releaseStatusMock.target))

		progressMonitorMock.setup((x) => x.getActiveStages(releaseProgressMock.target)).returns(() => [stageOneProgress.target])

		//#region STAGE

		const stageStatusMock = Mock.ofType<ReleaseEnvironment>()

		releaseHelperMock
			.setup((x) => x.getStageStatus(releaseStatusMock.target, stageOneProgress.target.name))
			.returns(() => Promise.resolve(stageStatusMock.target))

		releaseApproverMock.setup((x) => x.isStageApproved(stageOneProgress.target, stageStatusMock.target)).returns(() => Promise.resolve(false))

		releaseApproverMock
			.setup((x) =>
				x.approveStage(
					stageOneProgress.target,
					stageStatusMock.target,
					releaseJobMock.target.project.name!,
					detailsMock.target,
					releaseJobMock.target.settings,
				),
			)
			.returns(() => Promise.resolve())

		progressMonitorMock.setup((x) => x.updateStageProgress(stageOneProgress.target, stageStatusMock.target)).returns(() => null)

		progressMonitorMock.setup((x) => x.isStageCompleted(stageOneProgress.target)).returns(() => true)

		//#endregion

		progressMonitorMock.setup((x) => x.updateReleaseProgress(releaseProgressMock.target)).returns(() => null)

		releaseProgressMock.setup((x) => x.status).returns(() => ReleaseStatus.InProgress)

		commonHelperMock.setup((x) => x.wait(releaseJobMock.target.settings.sleep)).returns(() => Promise.resolve())

		releaseProgressMock.setup((x) => x.status).returns(() => ReleaseStatus.Succeeded)

		//#endregion

		//#region ACT

		const result = await deployer.deployAutomated(releaseJobMock.target, detailsMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.status, ReleaseStatus.Succeeded, "Release status should be Succeeded")

		//#endregion
	})
})
