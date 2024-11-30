import { BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"

import { ILogger } from "../../loggers/ilogger"
import { IDebug } from "../../loggers/idebug"
import { IDefinitionSelector } from "./idefinitionselector"
import { IBuildApiRetry } from "../../extensions/buildapiretry/ibuildapiretry"

export class DefinitionSelector implements IDefinitionSelector {
	private debugLogger: IDebug

	private buildApi: IBuildApiRetry

	constructor(buildApi: IBuildApiRetry, logger: ILogger) {
		this.debugLogger = logger.extend(this.constructor.name)

		this.buildApi = buildApi
	}

	public async getDefinition(projectName: string, definitionName: string): Promise<BuildDefinition> {
		const debug = this.debugLogger.extend(this.getDefinition.name)

		const matchingDefinitions: BuildDefinition[] = await this.buildApi.getDefinitions(projectName, definitionName)

		debug(matchingDefinitions.map((definition) => `${definition.name} (${definition.id})`))

		if (matchingDefinitions.length <= 0) {
			throw new Error(`Definition <${definitionName}> not found`)
		}

		const targetDefinition: BuildDefinition = await this.buildApi.getDefinition(projectName, matchingDefinitions[0].id!)

		debug(targetDefinition)

		return targetDefinition
	}
}
