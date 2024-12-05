import "mocha"
import { faker } from "@faker-js/faker"
import { ILogger } from "../../loggers/ilogger"
import { IDebug } from "../../loggers/idebug"
import { IRunCreator } from "../../workers/runcreator/iruncreator"
import { IRunDeployer } from "../../workers/rundeployer/irundeployer"
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter"
import { IParameters } from "../../helpers/taskhelper/iparameters"
import { IRun } from "../../workers/runcreator/irun"
import { IRunProgress } from "../../orchestrator/irunprogress"
import { IOrchestrator } from "../../orchestrator/iorchestrator"
import { Orchestrator } from "../../orchestrator/orchestrator"
import { Strategy } from "../../helpers/taskhelper/strategy"
import assert from "assert"
import { Mock, It, Times } from "typemoq"

describe("Orchestrator", async () => {
	const loggerMock = Mock.ofType<ILogger>()
	const debugMock = Mock.ofType<IDebug>()

	loggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	loggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	debugMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	const runCreatorMock = Mock.ofType<IRunCreator>()
	const runDeployerMock = Mock.ofType<IRunDeployer>()
	const progressReporterMock = Mock.ofType<IProgressReporter>()

	const parametersMock = {
		projectName: faker.word.sample(),
		definitionName: faker.word.sample(),
	} as IParameters

	const runMock = {
		project: It.isAny(),
		definition: It.isAny(),
		build: It.isAny(),
	} as IRun

	const runProgressMock = {
		id: faker.number.int(),
	} as IRunProgress

	const orchestrator: IOrchestrator = new Orchestrator(runCreatorMock.object, runDeployerMock.object, progressReporterMock.object, loggerMock.object)

	beforeEach(async () => {
		runCreatorMock.reset()
		runDeployerMock.reset()
		progressReporterMock.reset()

		progressReporterMock.setup((x) => x.logRun(It.isAny())).returns(() => null)

		progressReporterMock.setup((x) => x.logRunProgress(It.isAny())).returns(() => null)
	})

	it("Should orchestrate new run", async () => {
		//#region ARRANGE

		parametersMock.strategy = Strategy.New

		runCreatorMock
			.setup((x) => x.create(parametersMock))
			.returns(() => Promise.resolve(runMock))
			.verifiable(Times.once())

		runDeployerMock
			.setup((x) => x.deployAutomated(runMock))
			.returns(() => Promise.resolve(runProgressMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await orchestrator.orchestrate(parametersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		runCreatorMock.verifyAll()
		runDeployerMock.verifyAll()

		//#endregion
	})

	it("Should orchestrate latest run", async () => {
		//#region ARRANGE

		parametersMock.strategy = Strategy.Latest

		runCreatorMock
			.setup((x) => x.create(parametersMock))
			.returns(() => Promise.resolve(runMock))
			.verifiable(Times.once())

		runDeployerMock
			.setup((x) => x.deployManual(runMock))
			.returns(() => Promise.resolve(runProgressMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await orchestrator.orchestrate(parametersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		runCreatorMock.verifyAll()
		runDeployerMock.verifyAll()

		//#endregion
	})

	it("Should orchestrate specific run", async () => {
		//#region ARRANGE

		parametersMock.strategy = Strategy.Specific

		runCreatorMock
			.setup((x) => x.create(parametersMock))
			.returns(() => Promise.resolve(runMock))
			.verifiable(Times.once())

		runDeployerMock
			.setup((x) => x.deployManual(runMock))
			.returns(() => Promise.resolve(runProgressMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await orchestrator.orchestrate(parametersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		runCreatorMock.verifyAll()
		runDeployerMock.verifyAll()

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
