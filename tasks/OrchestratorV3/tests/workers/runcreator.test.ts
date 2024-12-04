import "mocha"
import { faker } from "@faker-js/faker"
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces"
import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { ILogger } from "../../loggers/ilogger"
import { IDebug } from "../../loggers/idebug"
import { IBuildSelector } from "../../helpers/buildselector/ibuildselector"
import { IDefinitionSelector } from "../../helpers/definitionselector/idefinitionselector"
import { IProjectSelector } from "../../helpers/projectselector/iprojectselector"
import { IFilterCreator } from "../../workers/filtercreator/ifiltercreator"
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter"
import { IRunCreator } from "../../workers/runcreator/iruncreator"
import { RunCreator } from "../../workers/runcreator/runcreator"
import { IParameters } from "../../helpers/taskhelper/iparameters"
import { Strategy } from "../../helpers/taskhelper/strategy"
import { IFilters } from "../../helpers/taskhelper/ifilters"
import assert from "assert"
import { Mock, It, Times } from "typemoq"

describe("RunCreator", async () => {
	const loggerMock = Mock.ofType<ILogger>()
	const debugMock = Mock.ofType<IDebug>()

	loggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	loggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	debugMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	const filtersMock = {
		buildNumber: faker.word.sample(),
	} as IFilters

	const parametersMock = {
		projectName: faker.word.sample(),
		definitionName: faker.word.sample(),
		filters: filtersMock,
	} as IParameters

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

	const projectSelectorMock = Mock.ofType<IProjectSelector>()
	const definitionSelectorMock = Mock.ofType<IDefinitionSelector>()
	const buildSelectorMock = Mock.ofType<IBuildSelector>()
	const filterCreatorMock = Mock.ofType<IFilterCreator>()
	const progressReporterMock = Mock.ofType<IProgressReporter>()

	const runCreator: IRunCreator = new RunCreator(
		projectSelectorMock.object,
		definitionSelectorMock.object,
		buildSelectorMock.object,
		filterCreatorMock.object,
		progressReporterMock.object,
		loggerMock.object,
	)

	beforeEach(async () => {
		projectSelectorMock.reset()
		definitionSelectorMock.reset()
		buildSelectorMock.reset()
		filterCreatorMock.reset()
		progressReporterMock.reset()

		projectSelectorMock
			.setup((x) => x.getProject(It.isAnyString()))
			.returns(() => Promise.resolve(projectMock))
			.verifiable(Times.once())

		definitionSelectorMock
			.setup((x) => x.getDefinition(It.isAnyString(), It.isAnyString()))
			.returns(() => Promise.resolve(definitionMock))
			.verifiable(Times.once())
	})

	it("Should create new run", async () => {
		//#region ARRANGE

		parametersMock.strategy = Strategy.New

		buildSelectorMock
			.setup((x) => x.createBuild(It.isAny(), It.isAny(), It.isAny(), It.isAny()))
			.returns(() => Promise.resolve(buildMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await runCreator.create(parametersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		projectSelectorMock.verifyAll()
		definitionSelectorMock.verifyAll()
		buildSelectorMock.verifyAll()

		//#endregion
	})

	it("Should target latest run", async () => {
		//#region ARRANGE

		parametersMock.strategy = Strategy.Latest

		buildSelectorMock
			.setup((x) => x.getLatestBuild(It.isAny(), It.isAny(), It.isAnyNumber()))
			.returns(() => Promise.resolve(buildMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await runCreator.create(parametersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		projectSelectorMock.verifyAll()
		definitionSelectorMock.verifyAll()
		buildSelectorMock.verifyAll()

		//#endregion
	})

	it("Should target specific run", async () => {
		//#region ARRANGE

		parametersMock.strategy = Strategy.Specific

		buildSelectorMock
			.setup((x) => x.getSpecificBuild(It.isAny(), It.isAnyString()))
			.returns(() => Promise.resolve(buildMock))
			.verifiable(Times.once())

		//#endregion

		//#region ACT

		const result = await runCreator.create(parametersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")

		projectSelectorMock.verifyAll()
		definitionSelectorMock.verifyAll()
		buildSelectorMock.verifyAll()

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
