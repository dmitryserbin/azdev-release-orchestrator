import {
	TaskResult,
	getBoolInput,
	getDelimitedInput,
	getEndpointAuthorizationParameter,
	getEndpointUrl,
	getInput,
	getVariable,
	setResult,
} from "azure-pipelines-task-lib/task"

import { ITaskHelper } from "../interfaces/helpers/itaskhelper"
import { IEndpoint } from "../interfaces/task/iendpoint"
import { IParameters } from "../interfaces/task/iparameters"
import { ReleaseType } from "../interfaces/common/ireleasetype"
import { IDebugCreator } from "../interfaces/loggers/idebugcreator"
import { IDebugLogger } from "../interfaces/loggers/idebuglogger"
import { IDetails } from "../interfaces/task/idetails"
import { ReleaseStatus } from "../interfaces/common/ireleasestatus"
import { IFilters } from "../interfaces/task/ifilters"
import { IReleaseVariable } from "../interfaces/common/ireleasevariable"
import { ISettings } from "../interfaces/common/isettings"
import { ICommonHelper } from "../interfaces/helpers/icommonhelper"

export class TaskHelper implements ITaskHelper {
	private debugLogger: IDebugLogger
	private commonHelper: ICommonHelper

	constructor(debugCreator: IDebugCreator, commonHelper: ICommonHelper) {
		this.debugLogger = debugCreator.extend(this.constructor.name)
		this.commonHelper = commonHelper
	}

	public async getEndpoint(): Promise<IEndpoint> {
		const debug = this.debugLogger.extend(this.getEndpoint.name)

		const endpointType: string = getInput("endpointType", true)!

		// Use upper-case default endpoint name
		// For compartability with non-Windows systems
		let endpointName: string = "SYSTEMVSSCONNECTION"
		let tokenParameterName: string = "AccessToken"

		// Get service endpoint
		if (endpointType === "service") {
			endpointName = getInput("endpointName", true)!
			tokenParameterName = "ApiToken"
		}

		const endpointUrl: string | undefined = getEndpointUrl(endpointName, false)
		const endpointToken: string | undefined = getEndpointAuthorizationParameter(endpointName, tokenParameterName, false)

		if (!endpointUrl) {
			throw new Error(`Unable to get <${endpointName}> endpoint URL`)
		}

		if (!endpointToken) {
			throw new Error(`Unable to get <${endpointName}> (${tokenParameterName}) endpoint token`)
		}

		const endpoint: IEndpoint = {
			url: endpointUrl,
			token: endpointToken,
		}

		debug(endpoint)

		return endpoint
	}

	public async getParameters(): Promise<IParameters> {
		const debug = this.debugLogger.extend(this.getParameters.name)

		const releaseStrategy: string = getInput("releaseStrategy", true)!
		const projectName: string = getInput("projectName", true)!
		const definitionName: string = getInput("definitionName", true)!

		const updateInterval: string = getInput("updateInterval", true)!
		const approvalRetry: string = getInput("approvalRetry", true)!

		const filters: IFilters = {
			releaseTags: [],
			artifactTags: [],
			artifactVersion: "",
			artifactBranch: "",
			stageStatuses: [],
		}

		const settings: ISettings = {
			sleep: Number(updateInterval) ? Number(updateInterval) * 1000 : 5000,
			approvalRetry: Number(approvalRetry) ? Number(approvalRetry) : 60,
			approvalSleep: 60000,
		}

		let parameters: IParameters = {
			releaseType: ReleaseType.New,
			projectName: projectName,
			definitionName: definitionName,
			releaseName: "",
			stages: [],
			variables: [],
			filters,
			settings,
		}

		switch (releaseStrategy) {
			case "create": {
				parameters = await this.readCreateInputs(parameters)

				break
			}
			case "latest": {
				parameters = await this.readLatestInputs(parameters)

				break
			}
			case "specific": {
				parameters = await this.readSpecificInputs(parameters)

				break
			}
			default: {
				throw new Error(`Release strategy <${releaseStrategy}> not supported`)
			}
		}

		debug(parameters)

		return parameters
	}

	public async getDetails(): Promise<IDetails> {
		const debug = this.debugLogger.extend(this.getDetails.name)

		const endpointName: string | undefined = getInput("endpointName", false)
		const projectName: string | undefined = getVariable("SYSTEM_TEAMPROJECT")
		const releaseName: string | undefined = getVariable("RELEASE_RELEASENAME") ? getVariable("RELEASE_RELEASENAME") : getVariable("BUILD_BUILDNUMBER")
		const requesterName: string | undefined = getVariable("RELEASE_DEPLOYMENT_REQUESTEDFOR")
			? getVariable("RELEASE_DEPLOYMENT_REQUESTEDFOR")
			: getVariable("BUILD_REQUESTEDFOR")
		const requesterId: string | undefined = getVariable("RELEASE_DEPLOYMENT_REQUESTEDFORID")
			? getVariable("RELEASE_DEPLOYMENT_REQUESTEDFORID")
			: getVariable("BUILD_REQUESTEDFORID")

		const details: IDetails = {
			endpointName: endpointName ? endpointName : "Project Collection Build Service",
			projectName: projectName ? projectName : "Unknown",
			releaseName: releaseName ? releaseName : "Unknown",
			requesterName: requesterName ? requesterName : "Release Orchestrator",
			requesterId: requesterId ? requesterId : "Unknown",
		}

		debug(details)

		return details
	}

	public async validate(status: ReleaseStatus): Promise<void> {
		const debug = this.debugLogger.extend(this.validate.name)

		const partialMessage: string = "One or more release stages partially succeeded"
		const failedMessage: string = "One or more release stages deployment failed"

		debug(status)

		switch (status) {
			case ReleaseStatus.PartiallySucceeded: {
				if (await this.suppressSucceededWithIssues()) {
					break
				}

				setResult(TaskResult.SucceededWithIssues, partialMessage)

				break
			}
			case ReleaseStatus.Failed: {
				throw new Error(failedMessage)
			}
		}
	}

	public async fail(message: string): Promise<void> {
		const debug = this.debugLogger.extend(this.fail.name)

		const ignoreFailure: boolean = getBoolInput("ignoreFailure")

		const result: TaskResult = ignoreFailure ? TaskResult.SucceededWithIssues : TaskResult.Failed

		debug(`Task <${TaskResult[result]}> result (ignore failure <${ignoreFailure}>)`)

		if (result === TaskResult.SucceededWithIssues && (await this.suppressSucceededWithIssues())) {
			return
		}

		setResult(result, message)
	}

	private async readCreateInputs(parameters: IParameters): Promise<IParameters> {
		parameters.releaseType = ReleaseType.New

		// Optional to support variable input
		const definitionStages: string[] = getDelimitedInput("definitionStage", ",", false)
		const artifactVersion: string | undefined = getInput("artifactVersion", false)
		const artifactTags: string[] = getDelimitedInput("artifactTag", ",", false)
		const artifactBranch: string | undefined = getInput("artifactBranch", false)
		const releaseVariables: string[] = getDelimitedInput("releaseVariables", "\n", false)

		// Get definition stages filter
		if (definitionStages.length) {
			parameters.stages = definitionStages
		}

		// Get artifact version name filter
		if (artifactVersion) {
			parameters.filters.artifactVersion = artifactVersion
		}

		// Get artifact tag name filter
		if (artifactTags.length) {
			parameters.filters.artifactTags = artifactTags
		}

		// Get artifacts source branch filter
		if (artifactBranch) {
			parameters.filters.artifactBranch = artifactBranch
		}

		// Get release variables
		if (releaseVariables.length) {
			for (const variable of releaseVariables) {
				const value: [string, string] = this.commonHelper.parseKeyValue(variable)

				if (value) {
					const releaseVariable: IReleaseVariable = {
						name: value[0],
						value: value[1],
					}

					parameters.variables.push(releaseVariable)
				}
			}
		}

		return parameters
	}

	private async readLatestInputs(parameters: IParameters): Promise<IParameters> {
		parameters.releaseType = ReleaseType.Latest

		// Optional to support variable input
		const releaseStages: string[] = getDelimitedInput("releaseStage", ",", false)
		const releaseTags: string[] = getDelimitedInput("releaseTag", ",", false)
		const artifactVersion: string | undefined = getInput("artifactVersion", false)
		const artifactTags: string[] = getDelimitedInput("artifactTag", ",", false)
		const artifactBranch: string | undefined = getInput("artifactBranch", false)
		const stageStatuses: string[] = getDelimitedInput("stageStatus", ",", false)

		// Get release stages filter
		if (releaseStages.length) {
			parameters.stages = releaseStages
		}

		// Get release tag filter
		if (releaseTags.length) {
			parameters.filters.releaseTags = releaseTags
		}

		// Get artifact version filter
		if (artifactVersion) {
			parameters.filters.artifactVersion = artifactVersion
		}

		// Get artifact tag filter
		if (artifactTags.length) {
			parameters.filters.artifactTags = artifactTags
		}

		// Get artifacts source branch filter
		if (artifactBranch) {
			parameters.filters.artifactBranch = artifactBranch
		}

		// Get release stage status filter
		if (stageStatuses.length) {
			parameters.filters.stageStatuses = stageStatuses
		}

		return parameters
	}

	private async readSpecificInputs(parameters: IParameters): Promise<IParameters> {
		parameters.releaseType = ReleaseType.Specific

		const releaseStages: string[] = getDelimitedInput("releaseStage", ",", false)

		// Get release name
		parameters.releaseName = getInput("releaseName", true)!

		// Get release stages filter
		if (releaseStages.length) {
			parameters.stages = releaseStages
		}

		return parameters
	}

	private async suppressSucceededWithIssues(): Promise<boolean> {
		const debug = this.debugLogger.extend(this.suppressSucceededWithIssues.name)

		const result: boolean = getVariable("RELEASE_ORCHESTRATOR_SUPPRESS_SUCCEEDEDWITHISSUES") === "true" ? true : false

		debug(result)

		return result
	}
}
