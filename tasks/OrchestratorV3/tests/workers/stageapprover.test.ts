import "mocha"
import { faker } from "@faker-js/faker"
import { Build, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { ILogger } from "../../loggers/ilogger"
import { IDebug } from "../../loggers/idebug"
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper"
import { ISettings } from "../../helpers/taskhelper/isettings"
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage"
import { IStageSelector } from "../../helpers/stageselector/istageselector"
import { IStageApprover } from "../../workers/stageapprover/istageapprover"
import { StageApprover } from "../../workers/stageapprover/stageapprover"
import { IBuildSelector } from "../../helpers/buildselector/ibuildselector"
import { IBuildApproval } from "../../workers/progressmonitor/ibuildapproval"
import { IBuildCheck } from "../../workers/progressmonitor/ibuildcheck"
import assert from "assert"
import { Mock, It, Times } from "typemoq"

describe("StageApprover", async () => {
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
	let approvalOneMock: IBuildApproval
	let checkOneMock: IBuildCheck

	const commonHelperMock = Mock.ofType<ICommonHelper>()
	const buildSelectorMock = Mock.ofType<IBuildSelector>()
	const stageSelectorMock = Mock.ofType<IStageSelector>()

	const stageApprover: IStageApprover = new StageApprover(buildSelectorMock.object, stageSelectorMock.object, commonHelperMock.object, loggerMock.object)

	beforeEach(async () => {
		commonHelperMock.reset()
		buildSelectorMock.reset()
		stageSelectorMock.reset()

		settingsMock = {
			proceedSkippedStages: false,
			cancelFailedCheckpoint: true,
			updateInterval: 1,
			approvalAttempts: 0,
		} as ISettings

		approvalOneMock = {
			id: faker.word.sample(),
			state: TimelineRecordState.Pending,
			result: null,
		} as IBuildApproval

		checkOneMock = {
			id: faker.word.sample(),
			state: TimelineRecordState.Pending,
			result: null,
		} as IBuildCheck

		stageOneMock = {
			id: faker.word.sample(),
			name: faker.word.sample(),
			state: TimelineRecordState.Pending,
			attempt: {
				approval: 0,
				check: 0,
			},
			approvals: [approvalOneMock],
			checks: [checkOneMock],
		} as IBuildStage
	})

	it("Should successfully approve stage", async () => {
		//#region ARRANGE

		const approvedResult = { status: "approved" }

		stageSelectorMock
			.setup((x) => x.approveStage(buildMock, approvalOneMock, undefined))
			.returns(() => Promise.resolve(approvedResult))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await stageApprover.approve(stageOneMock, buildMock, settingsMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		stageSelectorMock.verifyAll()

		//#endregion
	})

	it("Should fail approval and cancel stage", async () => {
		//#region ARRANGE

		const approvedResult = { status: "failed" }

		stageSelectorMock
			.setup((x) => x.approveStage(buildMock, approvalOneMock, undefined))
			.returns(() => Promise.resolve(approvedResult))
			.verifiable(Times.once())

		buildSelectorMock
			.setup((x) => x.cancelBuild(buildMock))
			.returns(() => Promise.resolve(buildMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		await assert.rejects(stageApprover.approve(stageOneMock, buildMock, settingsMock), "Approval should be rejected")

		//#endregion

		//#region ASSERT

		stageSelectorMock.verifyAll()
		buildSelectorMock.verifyAll()

		//#endregion
	})

	it("Should successfully validate stage check", async () => {
		//#region ARRANGE

		checkOneMock.state = TimelineRecordState.Completed

		//#endregion

		//#region ACT

		const result = await stageApprover.check(stageOneMock, buildMock, settingsMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		//#endregion
	})

	it("Should fail validating and cancel stage", async () => {
		//#region ARRANGE

		buildSelectorMock
			.setup((x) => x.cancelBuild(buildMock))
			.returns(() => Promise.resolve(buildMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		await assert.rejects(stageApprover.check(stageOneMock, buildMock, settingsMock), "Validation should be rejected")

		//#endregion

		//#region ASSERT

		buildSelectorMock.verifyAll()

		//#endregion
	})

	it("Confirm pending approval", async () => {
		//#region ACT

		const result = stageApprover.isApprovalPending(stageOneMock)

		//#endregion

		//#region ASSERT

		assert.strictEqual(result, true, "Approval should be pending")

		//#endregion
	})

	it("Confirm pending check", async () => {
		//#region ACT

		const result = stageApprover.isCheckPending(stageOneMock)

		//#endregion

		//#region ASSERT

		assert.strictEqual(result, true, "Check should be pending")

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
