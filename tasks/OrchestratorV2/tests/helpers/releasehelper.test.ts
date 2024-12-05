import "mocha"
import assert from "assert"
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { ReleaseHelper } from "../../helpers/releasehelper"
import { IReleaseApiRetry } from "../../interfaces/extensions/ireleaseapiretry"
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { It, Mock } from "typemoq"

describe("ReleaseHelper", () => {
	const debugLoggerMock = Mock.ofType<IDebugLogger>()
	const debugCreatorMock = Mock.ofType<IDebugCreator>()
	const releaseApiRetryMock = Mock.ofType<IReleaseApiRetry>()

	debugCreatorMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)
	debugLoggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)

	const releaseHelper = new ReleaseHelper(releaseApiRetryMock.object, debugCreatorMock.object)
	const projectName = "projectName"

	it("Should set searchText arg", async () => {
		//#region Arrange

		const alphanumericDefinitionName = "abcdfe123"
		const isExactNameMatch = true
		const releaseDefinitionId = 123

		const releaseDefinitionMock = Mock.ofType<ReleaseDefinition>()
		releaseDefinitionMock.setup((x) => x.id).returns(() => releaseDefinitionId)

		const releaseDefinitions: ReleaseDefinition[] = [releaseDefinitionMock.target]

		releaseApiRetryMock
			.setup((x) =>
				x.getReleaseDefinitions(
					projectName,
					alphanumericDefinitionName,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					isExactNameMatch,
				),
			)
			.returns(() => Promise.resolve(releaseDefinitions))

		releaseApiRetryMock.setup((x) => x.getReleaseDefinition(projectName, releaseDefinitionId)).returns(() => Promise.resolve(releaseDefinitionMock.target))

		//#endregion

		//#region Act

		const releaseDefinition = await releaseHelper.getDefinition(projectName, alphanumericDefinitionName)

		//#endregion

		//#region Assert

		assert.notStrictEqual(releaseDefinition, undefined, "releaseDefinition is undefined")
		assert.strictEqual(releaseDefinition.id, releaseDefinitionId, "releaseDefinition.id is not equal to releaseDefinitionId")

		//#endregion
	})

	it("Should set definitionIdsFilter arg", async () => {
		//#region Arrange

		const numericDefinitionName = "101"
		const releaseDefinitionId = 101

		const releaseDefinitionMock = Mock.ofType<ReleaseDefinition>()
		releaseDefinitionMock.setup((x) => x.id).returns(() => releaseDefinitionId)

		const releaseDefinitions: ReleaseDefinition[] = [releaseDefinitionMock.target]

		releaseApiRetryMock
			.setup((x) =>
				x.getReleaseDefinitions(
					projectName,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					It.is((x) => x![0] === numericDefinitionName),
				),
			)
			.returns(() => Promise.resolve(releaseDefinitions))

		releaseApiRetryMock.setup((x) => x.getReleaseDefinition(projectName, releaseDefinitionId)).returns(() => Promise.resolve(releaseDefinitionMock.target))

		//#endregion

		//#region Act

		const releaseDefinition = await releaseHelper.getDefinition(projectName, numericDefinitionName)

		//#endregion

		//#region Assert

		assert.notStrictEqual(releaseDefinition, undefined, "releaseDefinition is undefined")
		assert.strictEqual(releaseDefinition.id, releaseDefinitionId, "releaseDefinition.id is not equal to releaseDefinitionId")

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
