import "mocha"
import { faker } from "@faker-js/faker"
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces"
import { Build, BuildDefinition, TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { ILogger } from "../../loggers/ilogger"
import { IDebug } from "../../loggers/idebug"
import { IProgressMonitor } from "../../workers/progressmonitor/iprogressmonitor"
import { ProgressMonitor } from "../../workers/progressmonitor/progressmonitor"
import { IRun } from "../../workers/runcreator/irun"
import { ISettings } from "../../helpers/taskhelper/isettings"
import { IRunStage } from "../../workers/runcreator/irunstage"
import { RunStatus } from "../../orchestrator/runstatus"
import { IRunProgress } from "../../orchestrator/irunprogress"
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage"
import assert from "assert"
import { Mock, It } from "typemoq"

describe("ProgressMonitor", async () => {
	const loggerMock = Mock.ofType<ILogger>()
	const debugMock = Mock.ofType<IDebug>()

	loggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	loggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	debugMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	const projectMock = {
		name: faker.word.sample(),
		id: faker.word.sample(),
		_links: {
			web: {
				href: "https://my.project.uri",
			},
		},
	} as TeamProject

	const definitionMock = {
		name: faker.word.sample(),
		id: faker.number.int(),
	} as BuildDefinition

	const buildMock = {
		buildNumber: faker.word.sample(),
		id: faker.number.int(),
	} as Build

	let runMock: IRun
	let runStageOneMock: IRunStage

	let runProgressMock: IRunProgress
	let buildStageOneMock: IBuildStage

	const progressMonitor: IProgressMonitor = new ProgressMonitor(loggerMock.object)

	beforeEach(async () => {
		runStageOneMock = {
			id: faker.word.sample(),
			name: faker.word.sample(),
			target: true,
		} as IRunStage

		runMock = {
			project: projectMock,
			definition: definitionMock,
			build: buildMock,
			stages: [],
			settings: {} as ISettings,
		} as IRun

		buildStageOneMock = {
			id: runStageOneMock.id,
			name: runStageOneMock.name,
			state: TimelineRecordState.Pending,
		} as IBuildStage

		runProgressMock = {
			id: faker.number.int(),
			name: faker.word.sample(),
			project: faker.word.sample(),
			url: faker.word.sample(),
			stages: [],
			status: RunStatus.InProgress,
		} as IRunProgress
	})

	it("Should create run progress", async () => {
		//#region ARRANGE

		runMock.stages = [runStageOneMock]

		//#endregion

		//#region ACT

		const result = progressMonitor.createRunProgress(runMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.name, buildMock.buildNumber, "Build number should match")
		assert.strictEqual(result.id, buildMock.id, "Build ID should match")
		assert.strictEqual(result.project, projectMock.name, "Project name should match")
		assert.strictEqual(result.status, RunStatus.InProgress, "Run status should be in progress")

		assert.strictEqual(result.stages.length, 1, "There should be one stage")
		assert.strictEqual(result.stages[0].name, runStageOneMock.name, "Stage name should match")
		assert.strictEqual(result.stages[0].id, runStageOneMock.id, "Stage ID should match")
		assert.strictEqual(result.stages[0].state, TimelineRecordState.Pending, "Stage state should be pending")

		//#endregion
	})

	it("Should update run progress (succeeded)", async () => {
		//#region ARRANGE

		buildStageOneMock.state = TimelineRecordState.Completed
		buildStageOneMock.result = TaskResult.Succeeded

		runProgressMock.stages = [buildStageOneMock]

		//#endregion

		//#region ACT

		const result = progressMonitor.updateRunProgress(runProgressMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.status, RunStatus.Succeeded, "Run status should be succeeded")

		//#endregion
	})

	it("Should update run progress (partially succeeded)", async () => {
		//#region ARRANGE

		buildStageOneMock.state = TimelineRecordState.Completed
		buildStageOneMock.result = TaskResult.SucceededWithIssues

		runProgressMock.stages = [buildStageOneMock]

		//#endregion

		//#region ACT

		const result = progressMonitor.updateRunProgress(runProgressMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.status, RunStatus.PartiallySucceeded, "Run status should be partially succeeded")

		//#endregion
	})

	it("Should update run progress (failed)", async () => {
		//#region ARRANGE

		buildStageOneMock.state = TimelineRecordState.Completed
		buildStageOneMock.result = TaskResult.Failed

		runProgressMock.stages = [buildStageOneMock]

		//#endregion

		//#region ACT

		const result = progressMonitor.updateRunProgress(runProgressMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.status, RunStatus.Failed, "Run status should be failed")

		//#endregion
	})

	it("Should update run progress (in progress)", async () => {
		//#region ARRANGE

		buildStageOneMock.state = TimelineRecordState.InProgress
		buildStageOneMock.result = null

		runProgressMock.stages = [buildStageOneMock]

		//#endregion

		//#region ACT

		const result = progressMonitor.updateRunProgress(runProgressMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.status, RunStatus.InProgress, "Run status should be in progress")

		//#endregion
	})

	it("Should get active stages", async () => {
		//#region ARRANGE

		buildStageOneMock.state = TimelineRecordState.InProgress

		runProgressMock.stages = [buildStageOneMock]

		//#endregion

		//#region ACT

		const result = progressMonitor.getActiveStages(runProgressMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.length, 1, "There should be one active stage")
		assert.strictEqual(result[0].state, TimelineRecordState.InProgress, "Stage state should be in progress")

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
