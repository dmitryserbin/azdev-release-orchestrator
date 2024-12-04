import "mocha"
import { faker } from "@faker-js/faker"
import { Build, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { ILogger } from "../../loggers/ilogger"
import { IDebug } from "../../loggers/idebug"
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter"
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper"
import { ISettings } from "../../helpers/taskhelper/isettings"
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage"
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob"
import { IStageDeployer } from "../../workers/stagedeployer/istagedeployer"
import { StageDeployer } from "../../workers/stagedeployer/stagedeployer"
import { IStageSelector } from "../../helpers/stageselector/istageselector"
import { IStageApprover } from "../../workers/stageapprover/istageapprover"
import { IBuildTask } from "../../workers/progressmonitor/ibuildtask"
import { Mock, It, Times } from "typemoq"
import assert from "assert"

describe("StageDeployer", async () => {
	const loggerMock = Mock.ofType<ILogger>()
	const debugMock = Mock.ofType<IDebug>()

	loggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	loggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	debugMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	const buildMock = {
		buildNumber: faker.word.sample(),
		id: faker.number.int(),
	} as Build

	let settingsMock: ISettings
	let stageOneMock: IBuildStage
	let jobOneMock: IBuildJob

	const commonHelperMock = Mock.ofType<ICommonHelper>()
	const stageSelectorMock = Mock.ofType<IStageSelector>()
	const stageApproverMock = Mock.ofType<IStageApprover>()
	const progressReporterMock = Mock.ofType<IProgressReporter>()

	const stageDeployer: IStageDeployer = new StageDeployer(
		commonHelperMock.object,
		stageSelectorMock.object,
		stageApproverMock.object,
		progressReporterMock.object,
		loggerMock.object,
	)

	beforeEach(async () => {
		commonHelperMock.reset()
		stageSelectorMock.reset()
		stageApproverMock.reset()
		progressReporterMock.reset()

		settingsMock = {
			proceedSkippedStages: false,
			updateInterval: 1,
			stageStartAttempts: 1,
			stageStartInterval: 1,
		} as ISettings

		jobOneMock = {
			id: faker.word.sample(),
			name: faker.word.sample(),
			tasks: [] as IBuildTask[],
		} as IBuildJob

		stageOneMock = {
			id: faker.word.sample(),
			name: faker.word.sample(),
			state: TimelineRecordState.Pending,
			jobs: [jobOneMock],
		} as IBuildStage
	})

	it("Should deploy manual", async () => {
		//#region ARRANGE

		const startedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.InProgress })
		const completedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.Completed })

		stageSelectorMock.setup((x) => x.startStage(buildMock, stageOneMock)).verifiable(Times.once())

		stageSelectorMock
			.setup((x) => x.confirmStage(buildMock, stageOneMock, settingsMock.stageStartAttempts, settingsMock.stageStartInterval))
			.returns(() => Promise.resolve(startedStageOneMock))
			.verifiable(Times.once())

		stageSelectorMock
			.setup((x) => x.getStage(buildMock, startedStageOneMock))
			.returns(() => Promise.resolve(startedStageOneMock))
			.verifiable(Times.once())

		stageApproverMock
			.setup((x) => x.isApprovalPending(startedStageOneMock))
			.returns(() => true)
			.verifiable(Times.once())

		stageApproverMock
			.setup((x) => x.approve(startedStageOneMock, buildMock, settingsMock))
			.returns(() => Promise.resolve(startedStageOneMock))
			.verifiable(Times.once())

		stageApproverMock
			.setup((x) => x.isCheckPending(startedStageOneMock))
			.returns(() => true)
			.verifiable(Times.once())

		stageApproverMock
			.setup((x) => x.check(startedStageOneMock, buildMock, settingsMock))
			.returns(() => Promise.resolve(completedStageOneMock))
			.verifiable(Times.once())

		progressReporterMock.setup((x) => x.logStageProgress(completedStageOneMock)).verifiable(Times.once())

		commonHelperMock
			.setup((x) => x.wait(settingsMock.updateInterval))
			.returns(() => Promise.resolve())
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await stageDeployer.deployManual(stageOneMock, buildMock, settingsMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.equal(result.state, TimelineRecordState.Completed, "Result state should be Completed")

		commonHelperMock.verifyAll()
		stageSelectorMock.verifyAll()
		stageApproverMock.verifyAll()
		progressReporterMock.verifyAll()

		//#endregion
	})

	it("Should deploy manual (skip tracking)", async () => {
		//#region ARRANGE

		settingsMock.skipTracking = true

		const startedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.InProgress })

		stageSelectorMock.setup((x) => x.startStage(buildMock, stageOneMock)).verifiable(Times.once())

		stageSelectorMock
			.setup((x) => x.confirmStage(buildMock, stageOneMock, settingsMock.stageStartAttempts, settingsMock.stageStartInterval))
			.returns(() => Promise.resolve(startedStageOneMock))
			.verifiable(Times.once())

		stageSelectorMock
			.setup((x) => x.getStage(buildMock, startedStageOneMock))
			.returns(() => Promise.resolve(startedStageOneMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await stageDeployer.deployManual(stageOneMock, buildMock, settingsMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.equal(result.state, TimelineRecordState.InProgress, "Result state should be InProgress")

		stageSelectorMock.verifyAll()

		//#endregion
	})

	it("Should deploy automated", async () => {
		//#region ARRANGE

		const startedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.InProgress, checkpoint: { state: TimelineRecordState.Pending } })
		const completedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.Completed })

		stageSelectorMock
			.setup((x) => x.getStage(buildMock, stageOneMock))
			.returns(() => Promise.resolve(startedStageOneMock))
			.verifiable(Times.once())

		stageApproverMock
			.setup((x) => x.isApprovalPending(startedStageOneMock))
			.returns(() => true)
			.verifiable(Times.once())

		stageApproverMock
			.setup((x) => x.approve(startedStageOneMock, buildMock, settingsMock))
			.returns(() => Promise.resolve(startedStageOneMock))
			.verifiable(Times.once())

		stageApproverMock
			.setup((x) => x.isCheckPending(startedStageOneMock))
			.returns(() => true)
			.verifiable(Times.once())

		stageApproverMock
			.setup((x) => x.check(startedStageOneMock, buildMock, settingsMock))
			.returns(() => Promise.resolve(completedStageOneMock))
			.verifiable(Times.once())

		progressReporterMock.setup((x) => x.logStageProgress(completedStageOneMock)).verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await stageDeployer.deployAutomated(stageOneMock, buildMock, settingsMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.equal(result.state, TimelineRecordState.Completed, "Result state should be Completed")

		stageSelectorMock.verifyAll()
		stageApproverMock.verifyAll()
		progressReporterMock.verifyAll()

		//#endregion
	})

	it("Should deploy automated (skip tracking)", async () => {
		//#region ARRANGE

		settingsMock.skipTracking = true

		const startedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.InProgress })

		stageSelectorMock
			.setup((x) => x.getStage(buildMock, stageOneMock))
			.returns(() => Promise.resolve(startedStageOneMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await stageDeployer.deployAutomated(stageOneMock, buildMock, settingsMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.equal(result.state, TimelineRecordState.InProgress, "Result state should be InProgress")

		stageSelectorMock.verifyAll()
		stageApproverMock.verifyAll()
		progressReporterMock.verifyAll()

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
