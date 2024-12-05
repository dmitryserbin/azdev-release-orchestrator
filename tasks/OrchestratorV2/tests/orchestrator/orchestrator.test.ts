import "mocha"
import { Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { IParameters } from "../../interfaces/task/iparameters"
import { IDetails } from "../../interfaces/task/idetails"
import { IOrchestrator } from "../../interfaces/orchestrator/iorchestrator"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { IConsoleLogger } from "../../interfaces/loggers/iconsolelogger"
import { Orchestrator } from "../../orchestrator/orchestrator"
import { IOrchestratorFactory } from "../../interfaces/factories/iorchestratorfactory"
import { ICreator } from "../../interfaces/orchestrator/icreator"
import { IDeployer } from "../../interfaces/orchestrator/ideployer"
import { IReporter } from "../../interfaces/orchestrator/ireporter"
import { IReleaseJob } from "../../interfaces/common/ireleasejob"
import { ReleaseType } from "../../interfaces/common/ireleasetype"
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger"
import { DeploymentType } from "../../interfaces/common/ideploymenttype"
import { IReleaseProgress } from "../../interfaces/common/ireleaseprogress"
import assert from "assert"
import { Mock, It, IMock } from "typemoq"

describe("Orchestrator", () => {
	const debugLoggerMock = Mock.ofType<IDebugLogger>()
	const debugCreatorMock = Mock.ofType<IDebugCreator>()
	debugCreatorMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)
	debugLoggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)

	const consoleLoggerMock = Mock.ofType<IConsoleLogger>()
	consoleLoggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	const creatorMock = Mock.ofType<ICreator>()
	const deployerMock = Mock.ofType<IDeployer>()

	const reporterMock = Mock.ofType<IReporter>()
	reporterMock.setup((x) => x.getRelease(It.isAny(), It.isAny())).returns(() => "")
	reporterMock.setup((x) => x.getReleaseProgress(It.isAny())).returns(() => "")

	const orchestratorFactoryMock = Mock.ofType<IOrchestratorFactory>()
	orchestratorFactoryMock.setup((x) => x.createCreator()).returns(() => Promise.resolve(creatorMock.target))
	orchestratorFactoryMock.setup((x) => x.createDeployer()).returns(() => Promise.resolve(deployerMock.target))
	orchestratorFactoryMock.setup((x) => x.createReporter()).returns(() => Promise.resolve(reporterMock.target))

	let detailsMock: IMock<IDetails>
	let parametersMock: IMock<IParameters>
	let releaseJobMock: IMock<IReleaseJob>
	let releaseProgressMock: IMock<IReleaseProgress>

	const orchestrator: IOrchestrator = new Orchestrator(orchestratorFactoryMock.target, debugCreatorMock.target, consoleLoggerMock.target)

	beforeEach(async () => {
		detailsMock = Mock.ofType<IDetails>()
		parametersMock = Mock.ofType<IParameters>()
		releaseJobMock = Mock.ofType<IReleaseJob>()
		releaseProgressMock = Mock.ofType<IReleaseProgress>()

		creatorMock.reset()
		deployerMock.reset()
		reporterMock.reset()
	})

	it("Should orchestrate new automated release", async () => {
		//#region ARRANGE

		parametersMock.target.releaseType = ReleaseType.New
		releaseJobMock.target.type = DeploymentType.Automated
		releaseJobMock.target.release = Mock.ofType<Release>().target

		creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(() => Promise.resolve(releaseJobMock.target))

		deployerMock.setup((x) => x.deployAutomated(releaseJobMock.target, detailsMock.target)).returns(() => Promise.resolve(releaseProgressMock.target))

		//#endregion

		//#region ACT

		const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		//#endregion
	})

	it("Should orchestrate new manual release", async () => {
		//#region ARRANGE

		parametersMock.target.releaseType = ReleaseType.New
		releaseJobMock.target.type = DeploymentType.Manual
		releaseJobMock.target.release = Mock.ofType<Release>().target

		creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(() => Promise.resolve(releaseJobMock.target))

		deployerMock.setup((x) => x.deployManual(releaseJobMock.target, detailsMock.target)).returns(() => Promise.resolve(releaseProgressMock.target))

		//#endregion

		//#region ACT

		const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		//#endregion
	})

	it("Should orchestrate latest manual release", async () => {
		//#region ARRANGE

		parametersMock.target.releaseType = ReleaseType.Latest
		releaseJobMock.target.type = DeploymentType.Manual
		releaseJobMock.target.release = Mock.ofType<Release>().target

		creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(() => Promise.resolve(releaseJobMock.target))

		deployerMock.setup((x) => x.deployManual(releaseJobMock.target, detailsMock.target)).returns(() => Promise.resolve(releaseProgressMock.target))

		//#endregion

		//#region ACT

		const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		//#endregion
	})

	it("Should orchestrate specific manual release", async () => {
		//#region ARRANGE

		parametersMock.target.releaseType = ReleaseType.Specific
		releaseJobMock.target.type = DeploymentType.Manual
		releaseJobMock.target.release = Mock.ofType<Release>().target

		creatorMock.setup((x) => x.createJob(parametersMock.target, detailsMock.target)).returns(() => Promise.resolve(releaseJobMock.target))

		deployerMock.setup((x) => x.deployManual(releaseJobMock.target, detailsMock.target)).returns(() => Promise.resolve(releaseProgressMock.target))

		//#endregion

		//#region ACT

		const result = await orchestrator.orchestrate(parametersMock.target, detailsMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		//#endregion
	})
})
