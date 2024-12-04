import "mocha"

import * as chai from "chai"
import * as TypeMoq from "typemoq"
import { ImportMock } from "ts-mock-imports"

import * as TaskLibrary from "azure-pipelines-task-lib/task"

import { ILogger } from "../../loggers/ilogger"
import { ITaskHelper } from "../../helpers/taskhelper/itaskhelper"
import { TaskHelper } from "../../helpers/taskhelper/taskhelper"
import { CommonHelper } from "../../helpers/commonhelper/commonhelper"
import { IDebug } from "../../loggers/idebug"
import { Strategy } from "../../helpers/taskhelper/strategy"

describe("TaskHelper", () => {
	const loggerMock = TypeMoq.Mock.ofType<ILogger>()
	const debugMock = TypeMoq.Mock.ofType<IDebug>()

	loggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null)

	loggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugMock.object)

	debugMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugMock.object)

	const endpointNameMock: string = "My-Endpoint"
	const endpointUrlMock: string = "https://dev.azure.com/My-Organization"
	const endpointTokenMock: string = "My-Token"

	const orchestratorProjectNameMock: string = "My-Orchestrator-Project"
	const orchestratorBuildNumberMock: string = "My-Orchestrator-Release"
	const orchestratorRequestedForName: string = "My-Requester-Name"
	const orchestratorRequestedForId: string = "My-Requester-Id"

	const projectNameMock: string = "My-Project"
	const definitionNameMock: string = "My-Definition"
	const stagesMock: string = "DEV,TEST,PROD"
	const branchNameMock: string = "DEV,TEST,PROD"
	const parametersMock: string[] = ["MyParameterOne=MyValueOne", "MyParameterTwo=MyValueTwo"]

	const cancelFailedCheckpointMock = false
	const proceedSkippedStagesMock = false
	const skipTrackingMock = false

	const updateIntervalMock: string = "1"
	const stageStartAttemptsMock: string = "1"
	const stageStartIntervalMock: string = "1"
	const approvalIntervalMock: string = "1"
	const approvalAttemptsMock: string = "1"

	let inputs: { [key: string]: string | boolean | string[] }
	let variables: { [key: string]: string }

	const taskHelper: ITaskHelper = new TaskHelper(loggerMock.target, new CommonHelper(loggerMock.object))

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

		chai.expect(result).to.not.eq(null)
		chai.expect(result.url).to.eq(endpointUrlMock)
		chai.expect(result.token).to.eq(endpointTokenMock)

		//#endregion
	})

	it("Should get new release parameters", async () => {
		//#region ARRANGE

		inputs["strategy"] = "new"
		inputs["projectName"] = projectNameMock
		inputs["definitionName"] = definitionNameMock

		inputs["cancelFailedCheckpoint"] = cancelFailedCheckpointMock
		inputs["proceedSkippedStages"] = proceedSkippedStagesMock
		inputs["skipTracking"] = skipTrackingMock

		inputs["updateInterval"] = updateIntervalMock
		inputs["stageStartAttempts"] = stageStartAttemptsMock
		inputs["stageStartInterval"] = stageStartIntervalMock
		inputs["approvalInterval"] = approvalIntervalMock
		inputs["approvalAttempts"] = approvalAttemptsMock

		inputs["endpointName"] = endpointNameMock
		variables["SYSTEM_TEAMPROJECT"] = orchestratorProjectNameMock
		variables["BUILD_BUILDNUMBER"] = orchestratorBuildNumberMock
		variables["BUILD_REQUESTEDFOR"] = orchestratorRequestedForName
		variables["BUILD_REQUESTEDFORID"] = orchestratorRequestedForId

		inputs["stages"] = stagesMock
		inputs["branchName"] = branchNameMock
		inputs["parameters"] = parametersMock

		//#endregion

		//#region ACT

		const result = await taskHelper.getParameters()

		//#endregion

		//#region ASSERT

		chai.expect(result).to.not.eq(null)
		chai.expect(result.strategy).to.eq(Strategy.New)
		chai.expect(result.projectName).to.eq(projectNameMock)
		chai.expect(result.definitionName).to.eq(definitionNameMock)

		//#endregion
	})
})
