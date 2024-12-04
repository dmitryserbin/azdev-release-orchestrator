import "mocha"
import { BuildResult } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { ILogger } from "../../loggers/ilogger"
import { IDebug } from "../../loggers/idebug"
import { IFilterCreator } from "../../workers/filtercreator/ifiltercreator"
import { FilterCreator } from "../../workers/filtercreator/filtercreator"
import { IFilters } from "../../helpers/taskhelper/ifilters"
import assert from "assert"
import { Mock, It } from "typemoq"

describe("FilterCreator", async () => {
	const loggerMock = Mock.ofType<ILogger>()
	const debugMock = Mock.ofType<IDebug>()

	loggerMock.setup((x) => x.log(It.isAny())).returns(() => null)

	loggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	debugMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugMock.object)

	let filtersMock: IFilters

	const filterCreator: IFilterCreator = new FilterCreator(loggerMock.object)

	beforeEach(async () => {
		filtersMock = {
			buildNumber: "",
			branchName: "",
			buildResult: "",
			buildTags: [],
			pipelineResources: {},
			repositoryResources: {},
		} as IFilters
	})

	it("Should create resource filter (branch name)", async () => {
		//#region ARRANGE

		filtersMock.branchName = "My-Branch"

		//#endregion

		//#region ACT

		const result = await filterCreator.createResourcesFilter(filtersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.notStrictEqual(result.repositories.self, null, "Repository self should not be null")
		assert.strictEqual(result.repositories.self.refName, `refs/heads/${filtersMock.branchName}`, "Branch name should match")

		//#endregion
	})

	it("Should create build filter (build result)", async () => {
		//#region ARRANGE

		filtersMock.buildResult = "Succeeded"

		//#endregion

		//#region ACT

		const result = await filterCreator.createBuildFilter(filtersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.buildResult, BuildResult.Succeeded, "Build result should be succeeded")

		//#endregion
	})

	it("Should create build filter (build tags)", async () => {
		//#region ARRANGE

		filtersMock.buildTags = ["One", "Two"]

		//#endregion

		//#region ACT

		const result = await filterCreator.createBuildFilter(filtersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.notStrictEqual(result.tagFilters, null, "Tag filters should not be null")
		assert.strictEqual(result.tagFilters, filtersMock.buildTags, "Build tags should match")

		//#endregion
	})

	it("Should create build filter (branch name)", async () => {
		//#region ARRANGE

		filtersMock.branchName = "My-Branch"

		//#endregion

		//#region ACT

		const result = await filterCreator.createBuildFilter(filtersMock)

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.branchName, `refs/heads/${filtersMock.branchName}`, "Branch name should match")

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
