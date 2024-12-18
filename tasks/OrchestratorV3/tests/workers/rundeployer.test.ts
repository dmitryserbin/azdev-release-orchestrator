import "mocha"
import { faker } from "@faker-js/faker"
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces"
import { Build, BuildDefinition, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { ILogger } from "../../loggers/ilogger"
import { IDebug } from "../../loggers/idebug"
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter"
import { IRunDeployer } from "../../workers/rundeployer/irundeployer"
import { RunDeployer } from "../../workers/rundeployer/rundeployer"
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper"
import { IProgressMonitor } from "../../workers/progressmonitor/iprogressmonitor"
import { IRun } from "../../workers/runcreator/irun"
import { ISettings } from "../../helpers/taskhelper/isettings"
import { IRunProgress } from "../../orchestrator/irunprogress"
import { RunStatus } from "../../orchestrator/runstatus"
import { IBuildStage } from "../../workers/progressmonitor/ibuildstage"
import { IBuildJob } from "../../workers/progressmonitor/ibuildjob"
import { IStageDeployer } from "../../workers/stagedeployer/istagedeployer"
import assert from "assert"
import { Mock, It, Times } from "typemoq"

describe("RunDeployer", async () => {
	const loggerMock = Mock.ofType<ILogger>()
	const debugMock = Mock.ofType<IDebug>()

	loggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	loggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	debugMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	const settingsMock = {
		proceedSkippedStages: false,
	} as ISettings

	const projectMock = {
		name: faker.word.sample(),
		id: faker.word.sample(),
	} as TeamProject

	const definitionMock = {
		name: faker.word.sample(),
		id: faker.number.int(),
	} as BuildDefinition

	const buildMock = {
		buildNumber: faker.word.sample(),
		id: faker.number.int(),
	} as Build

	const runMock = {
		project: projectMock,
		definition: definitionMock,
		build: buildMock,
		stages: [],
		settings: settingsMock,
	} as IRun

	let runProgressMock: IRunProgress
	let stageOneMock: IBuildStage

	const commonHelperMock = Mock.ofType<ICommonHelper>()
	const stageDeployerMock = Mock.ofType<IStageDeployer>()
	const progressMonitorMock = Mock.ofType<IProgressMonitor>()
	const progressReporterMock = Mock.ofType<IProgressReporter>()

	const runDeployer: IRunDeployer = new RunDeployer(
		commonHelperMock.object,
		stageDeployerMock.object,
		progressMonitorMock.object,
		progressReporterMock.object,
		loggerMock.object,
	)

	beforeEach(async () => {
		commonHelperMock.reset()
		stageDeployerMock.reset()
		progressMonitorMock.reset()
		progressReporterMock.reset()

		stageOneMock = {
			id: faker.word.sample(),
			name: faker.word.sample(),
			state: TimelineRecordState.Pending,
			jobs: [] as IBuildJob[],
		} as IBuildStage

		runProgressMock = {
			id: faker.number.int(),
			name: faker.word.sample(),
			project: faker.word.sample(),
			url: faker.word.sample(),
			stages: [stageOneMock],
			status: RunStatus.InProgress,
		} as IRunProgress
	})

	it("Should deploy manual", async () => {
		//#region ARRANGE

		progressMonitorMock
			.setup((x) => x.createRunProgress(runMock))
			.returns(() => runProgressMock)
			.verifiable(Times.once())

		stageDeployerMock
			.setup((x) => x.deployManual(stageOneMock, runMock.build, runMock.settings))
			.returns(() => Promise.resolve(Object.assign({}, stageOneMock, { state: TimelineRecordState.Completed })))
			.verifiable(Times.once())

		progressMonitorMock
			.setup((x) => x.updateRunProgress(runProgressMock))
			.returns(() => Object.assign({}, runProgressMock, { status: RunStatus.Succeeded }))
			.verifiable(Times.once())

		progressReporterMock.setup((x) => x.logStagesProgress(runProgressMock.stages)).verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await runDeployer.deployManual(runMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.status, RunStatus.Succeeded, "Run status should be succeeded")

		commonHelperMock.verifyAll()
		stageDeployerMock.verifyAll()
		progressMonitorMock.verifyAll()
		progressReporterMock.verifyAll()

		//#endregion
	})

	it("Should deploy automated", async () => {
		//#region ARRANGE

		const completedStageOneMock = Object.assign({}, stageOneMock, { state: TimelineRecordState.Completed })
		const succeededRunProgressMock = Object.assign({}, runProgressMock, { status: RunStatus.Succeeded })

		progressMonitorMock
			.setup((x) => x.createRunProgress(runMock))
			.returns(() => runProgressMock)
			.verifiable(Times.once())

		progressMonitorMock
			.setup((x) => x.getActiveStages(runProgressMock))
			.returns(() => [stageOneMock])
			.verifiable(Times.once())

		stageDeployerMock
			.setup((x) => x.deployAutomated(stageOneMock, runMock.build, runMock.settings))
			.returns(() => Promise.resolve(completedStageOneMock))
			.verifiable(Times.once())

		progressMonitorMock
			.setup((x) => x.updateRunProgress(runProgressMock))
			.returns(() => succeededRunProgressMock)
			.verifiable(Times.once())

		progressReporterMock.setup((x) => x.logStagesProgress(runProgressMock.stages)).verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await runDeployer.deployAutomated(runMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.status, RunStatus.Succeeded, "Run status should be succeeded")

		commonHelperMock.verifyAll()
		stageDeployerMock.verifyAll()
		progressMonitorMock.verifyAll()
		progressReporterMock.verifyAll()

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
