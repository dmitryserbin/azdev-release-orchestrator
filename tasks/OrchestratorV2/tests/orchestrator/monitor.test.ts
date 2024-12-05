import "mocha"
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces"
import { ApprovalStatus, DeploymentAttempt, EnvironmentStatus, Release, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger"
import { IMonitor } from "../../interfaces/orchestrator/imonitor"
import { Monitor } from "../../orchestrator/monitor"
import { IReleaseJob } from "../../interfaces/common/ireleasejob"
import { ReleaseStatus } from "../../interfaces/common/ireleasestatus"
import { IReleaseProgress } from "../../interfaces/common/ireleaseprogress"
import { IStageProgress } from "../../interfaces/common/istageprogress"
import assert from "assert"
import { Mock, It, IMock } from "typemoq"

describe("Monitor", () => {
	const debugLoggerMock = Mock.ofType<IDebugLogger>()
	const debugCreatorMock = Mock.ofType<IDebugCreator>()
	debugCreatorMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)
	debugLoggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)

	const projectIdMock: string = "1"
	const projectNameMock: string = "My-Project"
	const projectUrlMock: string = "domain.com"
	const projectLinksMock: unknown = { web: { href: projectUrlMock } }
	const releaseIdMock: number = 1
	const releaseNameMock: string = "My-Release"
	const releaseStageIdMock: number = 1
	const releaseStageNameMock: string = "DEV"
	const releaseStageDeploymentIdMock: number = 1

	let releaseProgressMock: IMock<IReleaseProgress>
	let stageProgressMock: IMock<IStageProgress>

	let releaseJobMock: IMock<IReleaseJob>
	let projectMock: IMock<TeamProject>
	let releaseMock: IMock<Release>
	let releaseStageMock: IMock<ReleaseEnvironment>
	let stageDeploymentAttempt: IMock<DeploymentAttempt>

	const progressMonitor: IMonitor = new Monitor(debugCreatorMock.target)

	beforeEach(async () => {
		releaseProgressMock = Mock.ofType<IReleaseProgress>()
		stageProgressMock = Mock.ofType<IStageProgress>()

		projectMock = Mock.ofType<TeamProject>()
		projectMock.setup((x) => x.id).returns(() => projectIdMock)
		projectMock.setup((x) => x.name).returns(() => projectNameMock)
		projectMock.setup((x) => x._links).returns(() => projectLinksMock)

		stageDeploymentAttempt = Mock.ofType<DeploymentAttempt>()
		stageDeploymentAttempt.setup((x) => x.deploymentId).returns(() => releaseStageDeploymentIdMock)

		releaseStageMock = Mock.ofType<ReleaseEnvironment>()
		releaseStageMock.setup((x) => x.name).returns(() => releaseStageNameMock)
		releaseStageMock.setup((x) => x.id).returns(() => releaseStageIdMock)

		releaseMock = Mock.ofType<Release>()
		releaseMock.setup((x) => x.name).returns(() => releaseNameMock)
		releaseMock.setup((x) => x.id).returns(() => releaseIdMock)

		releaseJobMock = Mock.ofType<IReleaseJob>()
		releaseJobMock.target.project = projectMock.target
		releaseJobMock.target.release = releaseMock.target
	})

	it("Should create new release progress", async () => {
		//#region ARRANGE

		releaseMock.setup((x) => x.environments).returns(() => [releaseStageMock.target])
		releaseJobMock.target.stages = [releaseStageNameMock]

		//#endregion

		//#region ACT

		const result = progressMonitor.createProgress(releaseJobMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.id, releaseIdMock, "Release ID should match")
		assert.strictEqual(result.name, releaseNameMock, "Release name should match")
		assert.strictEqual(result.project, projectNameMock, "Project name should match")
		assert.strictEqual(result.url, `${projectUrlMock}/_release?releaseId=${releaseIdMock}`, "Release URL should match")
		assert.strictEqual(result.status, ReleaseStatus.InProgress, "Release status should be InProgress")

		assert.strictEqual(result.stages.length, 1, "There should be one stage")
		assert.strictEqual(result.stages[0].name, releaseStageNameMock, "Stage name should match")
		assert.strictEqual(result.stages[0].id, releaseStageIdMock, "Stage ID should match")
		assert.strictEqual(result.stages[0].approval.status, ApprovalStatus.Pending, "Approval status should be Pending")
		assert.strictEqual(result.stages[0].status, EnvironmentStatus.NotStarted, "Stage status should be NotStarted")

		//#endregion
	})

	it("Should update completed release progress", async () => {
		//#region ARRANGE

		stageProgressMock.target.status = EnvironmentStatus.Succeeded
		releaseProgressMock.target.stages = [stageProgressMock.target]

		//#endregion

		//#region ACT

		progressMonitor.updateReleaseProgress(releaseProgressMock.target)

		//#endregion

		//#region ASSERT

		assert.strictEqual(releaseProgressMock.target.status, ReleaseStatus.Succeeded, "Release status should be Succeeded")

		//#endregion
	})

	it("Should update failed release progress", async () => {
		//#region ARRANGE

		stageProgressMock.target.status = EnvironmentStatus.Rejected
		releaseProgressMock.target.stages = [stageProgressMock.target]

		//#endregion

		//#region ACT

		progressMonitor.updateReleaseProgress(releaseProgressMock.target)

		//#endregion

		//#region ASSERT

		assert.strictEqual(releaseProgressMock.target.status, ReleaseStatus.Failed, "Release status should be Failed")

		//#endregion
	})

	it("Should update partially succeeded release progress", async () => {
		//#region ARRANGE

		stageProgressMock.target.status = EnvironmentStatus.PartiallySucceeded
		releaseProgressMock.target.stages = [stageProgressMock.target]

		//#endregion

		//#region ACT

		progressMonitor.updateReleaseProgress(releaseProgressMock.target)

		//#endregion

		//#region ASSERT

		assert.strictEqual(releaseProgressMock.target.status, ReleaseStatus.PartiallySucceeded, "Release status should be PartiallySucceeded")

		//#endregion
	})

	it("Should update stage progress", async () => {
		//#region ARRANGE

		const timeToDeployMock: number = 1
		const statusMock: EnvironmentStatus = EnvironmentStatus.InProgress

		releaseStageMock.setup((x) => x.status).returns(() => statusMock)
		releaseStageMock.setup((x) => x.release).returns(() => releaseMock.target)
		releaseStageMock.setup((x) => x.deploySteps).returns(() => [stageDeploymentAttempt.target])
		releaseStageMock.setup((x) => x.timeToDeploy).returns(() => timeToDeployMock)

		//#endregion

		//#region ACT

		progressMonitor.updateStageProgress(stageProgressMock.target, releaseStageMock.target)

		//#endregion

		//#region ASSERT

		assert.strictEqual(stageProgressMock.target.status, statusMock, "Stage status should match")
		assert.strictEqual(stageProgressMock.target.id, releaseStageMock.target.id, "Stage ID should match")
		assert.strictEqual(stageProgressMock.target.release, releaseMock.target.name, "Release name should match")
		assert.strictEqual(stageProgressMock.target.deployment, stageDeploymentAttempt.target, "Deployment should match")
		assert.strictEqual(stageProgressMock.target.duration, timeToDeployMock.toLocaleString(), "Duration should match")

		//#endregion
	})
})
