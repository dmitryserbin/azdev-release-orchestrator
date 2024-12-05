import "mocha"
import * as TaskLibrary from "azure-pipelines-task-lib/task"
import { ImportMock } from "ts-mock-imports"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger"
import { TaskHelper } from "../../helpers/taskhelper"
import { ITaskHelper } from "../../interfaces/helpers/itaskhelper"
import { CommonHelper } from "../../helpers/commonhelper"
import assert from "assert"
import { It, Mock } from "typemoq"

describe("TaskHelper", () => {
	const debugLoggerMock = Mock.ofType<IDebugLogger>()
	const debugCreatorMock = Mock.ofType<IDebugCreator>()
	debugCreatorMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)
	debugLoggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)

	const endpointNameMock: string = "My-Endpoint"
	const endpointUrlMock: string = "https://dev.azure.com/My-Organization"
	const endpointTokenMock: string = "My-Token"

	const orchestratorProjectNameMock: string = "My-Orchestrator-Project"
	const orchestratorReleaseNameMock: string = "My-Orchestrator-Release"
	const orchestratorRequesterNameMock: string = "My-Requester-Name"
	const orchestratorRequesterIdMock: string = "My-Requester-Id"

	const projectNameMock: string = "My-Project"
	const definitionNameMock: string = "My-Definition"
	const definitionStageMock: string = "DEV,TEST,PROD"
	const releaseNameMock: string = "My-Release"
	const releaseStageMock: string = "DEV,TEST,PROD"

	const releaseTagMock: string = "My-Tag-One,My-Tag-Two"
	const artifactVersionMock: string = "My-Build-01"
	const artifactTagMock: string = "My-Artifact-Tag-One,My-Artifact-Tag-Two"
	const artifactBranchMock: string = "My-Branch"
	const stageStatusMock: string = "succeeded,rejected"

	const releaseVariablesMock: string = "My-Variable-One=My-Value-One"

	const updateIntervalMock: string = "1"
	const approvalRetryMock: string = "1"

	let inputs: { [key: string]: string | boolean }
	let variables: { [key: string]: string }

	const taskHelper: ITaskHelper = new TaskHelper(debugCreatorMock.target, new CommonHelper(debugCreatorMock.object))

	beforeEach(async () => {
		const getInputMock = ImportMock.mockFunction(TaskLibrary, "getInput")
		getInputMock.callsFake((i) => {
			return inputs[i] || null
		})

		const getBoolInputMock = ImportMock.mockFunction(TaskLibrary, "getBoolInput")
		getBoolInputMock.callsFake((i) => {
			return typeof inputs[i] === "boolean" ? inputs[i] : false
		})

		const getDelimitedInputMock = ImportMock.mockFunction(TaskLibrary, "getDelimitedInput")
		getDelimitedInputMock.callsFake((i) => {
			return inputs[i] ? inputs[i].toString().split(",") : []
		})

		const getVariableMock = ImportMock.mockFunction(TaskLibrary, "getVariable")
		getVariableMock.callsFake((i) => {
			return variables[i] || null
		})

		inputs = {}
		variables = {}
	})

	afterEach(async () => {
		ImportMock.restore()
	})

	it("Should get service endpoint", async () => {
		//#region ARRANGE

		inputs["endpointName"] = endpointNameMock
		inputs["endpointType"] = "service"

		const getEndpointUrlMock = ImportMock.mockFunction(TaskLibrary, "getEndpointUrl")
		getEndpointUrlMock.callsFake(() => endpointUrlMock)

		const getEndpointAuthorizationParameterMock = ImportMock.mockFunction(TaskLibrary, "getEndpointAuthorizationParameter")
		getEndpointAuthorizationParameterMock.callsFake(() => endpointTokenMock)

		//#endregion

		//#region ACT

		const result = await taskHelper.getEndpoint()

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.url, endpointUrlMock, "Result URL should match the mocked endpoint URL")
		assert.strictEqual(result.token, endpointTokenMock, "Result token should match the mocked endpoint token")

		//#endregion
	})

	it("Should get new release parameters", async () => {
		//#region ARRANGE

		inputs["releaseStrategy"] = "create"
		inputs["projectName"] = projectNameMock
		inputs["definitionName"] = definitionNameMock

		inputs["definitionStage"] = definitionStageMock
		inputs["artifactVersion"] = artifactVersionMock
		inputs["artifactTag"] = artifactTagMock
		inputs["artifactBranch"] = artifactBranchMock
		inputs["releaseVariables"] = releaseVariablesMock

		inputs["updateInterval"] = updateIntervalMock
		inputs["approvalRetry"] = approvalRetryMock

		//#endregion

		//#region ACT

		const result = await taskHelper.getParameters()

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.releaseType, "New", "Release type should be 'New'")
		assert.strictEqual(result.projectName, projectNameMock, "Project name should match the mock")
		assert.strictEqual(result.definitionName, definitionNameMock, "Definition name should match the mock")

		assert.strictEqual(result.settings.sleep, Number(updateIntervalMock) * 1000, "Sleep setting should match the mock")
		assert.strictEqual(result.settings.approvalRetry, Number(approvalRetryMock), "Approval retry setting should match the mock")

		assert.deepStrictEqual(result.stages, ["DEV", "TEST", "PROD"], "Stages should match the mock")
		assert.strictEqual(result.filters.artifactVersion, artifactVersionMock, "Artifact version should match the mock")
		assert.deepStrictEqual(result.filters.artifactTags, ["My-Artifact-Tag-One", "My-Artifact-Tag-Two"], "Artifact tags should match the mock")
		assert.strictEqual(result.filters.artifactBranch, artifactBranchMock, "Artifact branch should match the mock")

		assert.strictEqual(result.variables.length, 1, "There should be one variable")
		assert.strictEqual(result.variables[0].name, "My-Variable-One", "Variable name should match the mock")
		assert.strictEqual(result.variables[0].value, "My-Value-One", "Variable value should match the mock")

		//#endregion
	})

	it("Should get latest release parameters", async () => {
		//#region ARRANGE

		inputs["releaseStrategy"] = "latest"
		inputs["projectName"] = projectNameMock
		inputs["definitionName"] = definitionNameMock

		inputs["releaseStage"] = releaseStageMock
		inputs["releaseTag"] = releaseTagMock
		inputs["artifactVersion"] = artifactVersionMock
		inputs["artifactTag"] = artifactTagMock
		inputs["artifactBranch"] = artifactBranchMock
		inputs["stageStatus"] = stageStatusMock

		inputs["updateInterval"] = updateIntervalMock
		inputs["approvalRetry"] = approvalRetryMock

		//#endregion

		//#region ACT

		const result = await taskHelper.getParameters()

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.releaseType, "Latest", "Release type should be 'Latest'")
		assert.strictEqual(result.projectName, projectNameMock, "Project name should match the mock")
		assert.strictEqual(result.definitionName, definitionNameMock, "Definition name should match the mock")

		assert.strictEqual(result.settings.sleep, Number(updateIntervalMock) * 1000, "Sleep setting should match the mock")
		assert.strictEqual(result.settings.approvalRetry, Number(approvalRetryMock), "Approval retry setting should match the mock")

		assert.deepStrictEqual(result.stages, ["DEV", "TEST", "PROD"], "Stages should match the mock")
		assert.deepStrictEqual(result.filters.releaseTags, ["My-Tag-One", "My-Tag-Two"], "Release tags should match the mock")
		assert.strictEqual(result.filters.artifactVersion, artifactVersionMock, "Artifact version should match the mock")
		assert.deepStrictEqual(result.filters.artifactTags, ["My-Artifact-Tag-One", "My-Artifact-Tag-Two"], "Artifact tags should match the mock")
		assert.strictEqual(result.filters.artifactBranch, artifactBranchMock, "Artifact branch should match the mock")
		assert.deepStrictEqual(result.filters.stageStatuses, ["succeeded", "rejected"], "Stage statuses should match the mock")

		//#endregion
	})

	it("Should get specific release parameters", async () => {
		//#region ARRANGE

		inputs["releaseStrategy"] = "specific"
		inputs["projectName"] = projectNameMock
		inputs["definitionName"] = definitionNameMock

		inputs["releaseName"] = releaseNameMock
		inputs["releaseStage"] = releaseStageMock

		inputs["updateInterval"] = updateIntervalMock
		inputs["approvalRetry"] = approvalRetryMock

		//#endregion

		//#region ACT

		const result = await taskHelper.getParameters()

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.releaseType, "Specific", "Release type should be 'Specific'")
		assert.strictEqual(result.projectName, projectNameMock, "Project name should match the mock")
		assert.strictEqual(result.definitionName, definitionNameMock, "Definition name should match the mock")

		assert.strictEqual(result.settings.sleep, Number(updateIntervalMock) * 1000, "Sleep setting should match the mock")
		assert.strictEqual(result.settings.approvalRetry, Number(approvalRetryMock), "Approval retry setting should match the mock")

		assert.strictEqual(result.releaseName, releaseNameMock, "Release name should match the mock")
		assert.deepStrictEqual(result.stages, ["DEV", "TEST", "PROD"], "Stages should match the mock")

		//#endregion
	})

	it("Should get orchestrator details", async () => {
		//#region ARRANGE

		inputs["endpointName"] = endpointNameMock

		variables["SYSTEM_TEAMPROJECT"] = orchestratorProjectNameMock
		variables["RELEASE_RELEASENAME"] = orchestratorReleaseNameMock
		variables["RELEASE_DEPLOYMENT_REQUESTEDFOR"] = orchestratorRequesterNameMock
		variables["RELEASE_DEPLOYMENT_REQUESTEDFORID"] = orchestratorRequesterIdMock

		//#endregion

		//#region ACT

		const result = await taskHelper.getDetails()

		//#endregion

		//#region ASSERT

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result.endpointName, endpointNameMock, "Endpoint name should match the mock")
		assert.strictEqual(result.projectName, orchestratorProjectNameMock, "Project name should match the mock")
		assert.strictEqual(result.releaseName, orchestratorReleaseNameMock, "Release name should match the mock")
		assert.strictEqual(result.requesterName, orchestratorRequesterNameMock, "Requester name should match the mock")
		assert.strictEqual(result.requesterId, orchestratorRequesterIdMock, "Requester ID should match the mock")

		//#endregion
	})
})
