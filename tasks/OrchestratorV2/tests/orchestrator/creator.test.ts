import "mocha"
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces"
import { Release, ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { IParameters } from "../../interfaces/task/iparameters"
import { IDetails } from "../../interfaces/task/idetails"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { IConsoleLogger } from "../../interfaces/loggers/iconsolelogger"
import { ICreator } from "../../interfaces/orchestrator/icreator"
import { IReporter } from "../../interfaces/orchestrator/ireporter"
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger"
import { Creator } from "../../orchestrator/creator"
import { ICoreHelper } from "../../interfaces/helpers/icorehelper"
import { IBuildHelper } from "../../interfaces/helpers/ibuildhelper"
import { IReleaseHelper } from "../../interfaces/helpers/ireleasehelper"
import { ReleaseType } from "../../interfaces/common/ireleasetype"
import { DeploymentType } from "../../interfaces/common/ideploymenttype"
import { IFilters } from "../../interfaces/task/ifilters"
import { ISettings } from "../../interfaces/common/isettings"
import { IReleaseFilter } from "../../interfaces/common/ireleasefilter"
import { IFiltrator } from "../../interfaces/orchestrator/ifiltrator"
import { IArtifactFilter } from "../../interfaces/common/iartifactfilter"
import * as assert from "assert"
import { IMock, It, Mock } from "typemoq"

describe("Creator", () => {
	const debugLoggerMock = Mock.ofType<IDebugLogger>()
	const debugCreatorMock = Mock.ofType<IDebugCreator>()
	debugCreatorMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)
	debugLoggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)

	const consoleLoggerMock = Mock.ofType<IConsoleLogger>()
	consoleLoggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	const reporterMock = Mock.ofType<IReporter>()
	reporterMock.setup((x) => x.getRelease(It.isAny(), It.isAny())).returns(() => "")
	reporterMock.setup((x) => x.getReleaseProgress(It.isAny())).returns(() => "")
	reporterMock.setup((x) => x.getFilters(It.isAny())).returns(() => "")
	reporterMock.setup((x) => x.getVariables(It.isAny())).returns(() => "")

	const coreHelperMock = Mock.ofType<ICoreHelper>()
	const buildHelperMock = Mock.ofType<IBuildHelper>()
	const releaseHelperMock = Mock.ofType<IReleaseHelper>()
	const filterCreatorMock = Mock.ofType<IFiltrator>()

	const releaseCount: number = 1

	let detailsMock: IMock<IDetails>
	let parametersMock: IMock<IParameters>
	let filtersMock: IMock<IFilters>
	let settingsMock: IMock<ISettings>

	const creator: ICreator = new Creator(
		coreHelperMock.target,
		releaseHelperMock.target,
		filterCreatorMock.target,
		reporterMock.target,
		debugCreatorMock.target,
		consoleLoggerMock.target,
	)

	beforeEach(async () => {
		detailsMock = Mock.ofType<IDetails>()
		parametersMock = Mock.ofType<IParameters>()
		filtersMock = Mock.ofType<IFilters>()
		settingsMock = Mock.ofType<ISettings>()

		parametersMock.target.filters = filtersMock.target
		parametersMock.target.settings = settingsMock.target

		coreHelperMock.reset()
		buildHelperMock.reset()
		releaseHelperMock.reset()
		filterCreatorMock.reset()
		reporterMock.reset()
	})

	it("Should create new release job", async () => {
		//#region ARRANGE

		parametersMock.target.releaseType = ReleaseType.New

		const projectMock = Mock.ofType<TeamProject>()
		const definitionMock = Mock.ofType<ReleaseDefinition>()
		const releaseMock = Mock.ofType<Release>()
		const artifactFilterMock = Mock.ofType<IArtifactFilter[]>()

		coreHelperMock.setup((x) => x.getProject(parametersMock.target.projectName)).returns(() => Promise.resolve(projectMock.target))

		releaseHelperMock
			.setup((x) => x.getDefinition(projectMock.target.name!, parametersMock.target.definitionName))
			.returns(() => Promise.resolve(definitionMock.target))

		filterCreatorMock
			.setup((x) => x.createArtifactFilter(projectMock.target, definitionMock.target, parametersMock.target.filters))
			.returns(() => Promise.resolve(artifactFilterMock.target))

		releaseHelperMock
			.setup((x) => x.createRelease(projectMock.target.name!, definitionMock.target, detailsMock.target))
			.returns(() => Promise.resolve(releaseMock.target))

		releaseHelperMock.setup((x) => x.getReleaseStages(releaseMock.target, parametersMock.target.stages)).returns(() => Promise.resolve([]))

		releaseHelperMock.setup((x) => x.getReleaseType(releaseMock.target)).returns(() => Promise.resolve(DeploymentType.Automated))

		//#endregion

		//#region ACT

		const result = await creator.createJob(parametersMock.target, detailsMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		//#endregion
	})

	it("Should create latest release job", async () => {
		//#region ARRANGE

		parametersMock.target.releaseType = ReleaseType.Latest

		const projectMock = Mock.ofType<TeamProject>()
		const definitionMock = Mock.ofType<ReleaseDefinition>()
		const releaseMock = Mock.ofType<Release>()
		const releaseFilterMock = Mock.ofType<IReleaseFilter>()

		coreHelperMock.setup((x) => x.getProject(parametersMock.target.projectName)).returns(() => Promise.resolve(projectMock.target))

		releaseHelperMock
			.setup((x) => x.getDefinition(projectMock.target.name!, parametersMock.target.definitionName))
			.returns(() => Promise.resolve(definitionMock.target))

		filterCreatorMock
			.setup((x) => x.createReleaseFilter(definitionMock.target, parametersMock.target.stages, parametersMock.target.filters))
			.returns(() => Promise.resolve(releaseFilterMock.target))

		releaseHelperMock
			.setup((x) =>
				x.getLastRelease(
					projectMock.target.name!,
					definitionMock.target.name!,
					definitionMock.target.id!,
					parametersMock.target.stages,
					releaseFilterMock.target,
					releaseCount,
				),
			)
			.returns(() => Promise.resolve(releaseMock.target))

		releaseHelperMock.setup((x) => x.getReleaseStages(releaseMock.target, parametersMock.target.stages)).returns(() => Promise.resolve([]))

		releaseHelperMock.setup((x) => x.getReleaseType(releaseMock.target)).returns(() => Promise.resolve(DeploymentType.Automated))

		//#endregion

		//#region ACT

		const result = await creator.createJob(parametersMock.target, detailsMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		//#endregion
	})

	it("Should create specific release job", async () => {
		//#region ARRANGE

		parametersMock.target.releaseType = ReleaseType.Specific

		const projectMock = Mock.ofType<TeamProject>()
		const definitionMock = Mock.ofType<ReleaseDefinition>()
		const releaseMock = Mock.ofType<Release>()

		coreHelperMock.setup((x) => x.getProject(parametersMock.target.projectName)).returns(() => Promise.resolve(projectMock.target))

		releaseHelperMock
			.setup((x) => x.getDefinition(projectMock.target.name!, parametersMock.target.definitionName))
			.returns(() => Promise.resolve(definitionMock.target))

		releaseHelperMock
			.setup((x) => x.getRelease(projectMock.target.name!, definitionMock.target.id!, parametersMock.target.releaseName, parametersMock.target.stages))
			.returns(() => Promise.resolve(releaseMock.target))

		releaseHelperMock.setup((x) => x.getReleaseStages(releaseMock.target, parametersMock.target.stages)).returns(() => Promise.resolve([]))

		releaseHelperMock.setup((x) => x.getReleaseType(releaseMock.target)).returns(() => Promise.resolve(DeploymentType.Automated))

		//#endregion

		//#region ACT

		const result = await creator.createJob(parametersMock.target, detailsMock.target)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		//#endregion
	})
})
