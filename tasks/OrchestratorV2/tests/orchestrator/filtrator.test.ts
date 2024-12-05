import "mocha"
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces"
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { Artifact, ArtifactMetadata, EnvironmentStatus, ReleaseDefinition, ReleaseStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { IParameters } from "../../interfaces/task/iparameters"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { IConsoleLogger } from "../../interfaces/loggers/iconsolelogger"
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger"
import { IBuildHelper } from "../../interfaces/helpers/ibuildhelper"
import { IReleaseHelper } from "../../interfaces/helpers/ireleasehelper"
import { IFilters } from "../../interfaces/task/ifilters"
import { ISettings } from "../../interfaces/common/isettings"
import { IFiltrator } from "../../interfaces/orchestrator/ifiltrator"
import { Filtrator } from "../../orchestrator/filtrator"
import { IMock, It, Mock } from "typemoq"
import assert from "assert"

describe("Filtrator", () => {
	const debugLoggerMock = Mock.ofType<IDebugLogger>()
	const debugCreatorMock = Mock.ofType<IDebugCreator>()
	debugCreatorMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)
	debugLoggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)

	const consoleLoggerMock = Mock.ofType<IConsoleLogger>()
	consoleLoggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	const buildHelperMock = Mock.ofType<IBuildHelper>()
	const releaseHelperMock = Mock.ofType<IReleaseHelper>()

	const buildCount: number = 1

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const projectReferenceMock: any = {
		name: "My-Project",
		id: "1",
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const definitionReferenceMock: any = {
		name: "My-Definition",
		id: "1",
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const buildDefinitionReferenceMock: any = {
		definition: definitionReferenceMock,
		project: projectReferenceMock,
	}

	let projectMock: IMock<TeamProject>
	let definitionMock: IMock<ReleaseDefinition>
	let parametersMock: IMock<IParameters>
	let filtersMock: IMock<IFilters>
	let settingsMock: IMock<ISettings>

	const filterCreator: IFiltrator = new Filtrator(buildHelperMock.target, releaseHelperMock.target, debugCreatorMock.target)

	beforeEach(async () => {
		projectMock = Mock.ofType<TeamProject>()
		definitionMock = Mock.ofType<ReleaseDefinition>()
		parametersMock = Mock.ofType<IParameters>()
		filtersMock = Mock.ofType<IFilters>()
		settingsMock = Mock.ofType<ISettings>()

		parametersMock.target.filters = filtersMock.target
		parametersMock.target.settings = settingsMock.target

		buildHelperMock.reset()
		releaseHelperMock.reset()
	})

	it("Should create artifact filter", async () => {
		//#region ARRANGE

		filtersMock.target.artifactVersion = "My-Build-01"
		filtersMock.target.artifactBranch = "My-Branch"
		filtersMock.target.artifactTags = ["My-Tag-One", "My-Tag-Two"]

		const artifactsMock = Mock.ofType<ArtifactMetadata[]>()

		const primaryBuildArtifactMock = Mock.ofType<Artifact>()
		primaryBuildArtifactMock.target.sourceId = "1"
		primaryBuildArtifactMock.target.definitionReference = buildDefinitionReferenceMock

		const buildArtifactMock = Mock.ofType<Build>()
		buildArtifactMock.target.id = 1

		releaseHelperMock
			.setup((x) => x.getDefinitionPrimaryArtifact(definitionMock.target, "Build"))
			.returns(() => Promise.resolve(primaryBuildArtifactMock.target))

		buildHelperMock
			.setup((x) =>
				x.findBuild(
					primaryBuildArtifactMock.target.definitionReference!.project.name!,
					primaryBuildArtifactMock.target.definitionReference!.definition.name!,
					Number(primaryBuildArtifactMock.target.definitionReference!.definition.id!),
					filtersMock.target.artifactVersion,
					parametersMock.target.filters.artifactTags,
					buildCount,
				),
			)
			.returns(() => Promise.resolve(buildArtifactMock.target))

		releaseHelperMock
			.setup((x) =>
				x.getArtifacts(
					projectMock.target.name!,
					definitionMock.target.id!,
					primaryBuildArtifactMock.target.sourceId!,
					buildArtifactMock.target.id!.toString(),
					parametersMock.target.filters.artifactBranch,
				),
			)
			.returns(() => Promise.resolve(artifactsMock.target))

		//#endregion

		//#region ACT

		const result = await filterCreator.createArtifactFilter(projectMock.target, definitionMock.target, parametersMock.target.filters)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		//#endregion
	})

	it("Should create release filter", async () => {
		//#region ARRANGE

		filtersMock.target.releaseTags = ["My-Tag-One", "My-Tag-Two"]
		filtersMock.target.artifactTags = ["My-Tag-One", "My-Tag-Two"]
		filtersMock.target.artifactVersion = "My-Build-01"
		filtersMock.target.artifactBranch = "My-Branch"
		filtersMock.target.stageStatuses = ["succeeded", "rejected"]

		const primaryBuildArtifactMock = Mock.ofType<Artifact>()
		primaryBuildArtifactMock.target.sourceId = "1"
		primaryBuildArtifactMock.target.definitionReference = buildDefinitionReferenceMock

		const buildArtifactMock = Mock.ofType<Build>()
		buildArtifactMock.target.id = 1

		releaseHelperMock
			.setup((x) => x.getDefinitionPrimaryArtifact(definitionMock.target, "Build"))
			.returns(() => Promise.resolve(primaryBuildArtifactMock.target))

		buildHelperMock
			.setup((x) =>
				x.findBuild(
					primaryBuildArtifactMock.target.definitionReference!.project.name!,
					primaryBuildArtifactMock.target.definitionReference!.definition.name!,
					Number(primaryBuildArtifactMock.target.definitionReference!.definition.id!),
					filtersMock.target.artifactBranch,
					parametersMock.target.filters.artifactTags,
					buildCount,
				),
			)
			.returns(() => Promise.resolve(buildArtifactMock.target))

		//#endregion

		//#region ACT

		const result = await filterCreator.createReleaseFilter(definitionMock.target, parametersMock.target.stages, parametersMock.target.filters)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.artifactVersionId, buildArtifactMock.target.id, "Artifact version ID should match")
		assert.strictEqual(result.artifactBranch, filtersMock.target.artifactBranch, "Artifact branch should match")
		assert.deepStrictEqual(result.tags, filtersMock.target.releaseTags, "Release tags should match")
		assert.deepStrictEqual(result.stages, parametersMock.target.stages, "Stages should match")
		assert.deepStrictEqual(result.stageStatuses, [EnvironmentStatus.Succeeded, EnvironmentStatus.Rejected], "Stage statuses should match")
		assert.strictEqual(result.releaseStatus, ReleaseStatus.Active, "Release status should be Active")

		//#endregion
	})
})
