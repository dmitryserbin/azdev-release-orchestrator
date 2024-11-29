import { IDebugCreator } from "../interfaces/loggers/idebugcreator"
import { IDebugLogger } from "../interfaces/loggers/idebuglogger"
import { ICommonHelper } from "../interfaces/helpers/icommonhelper"

export class CommonHelper implements ICommonHelper {
	private debugLogger: IDebugLogger

	constructor(debugCreator: IDebugCreator) {
		this.debugLogger = debugCreator.extend(this.constructor.name)
	}

	public async wait(count: number): Promise<void> {
		const debug = this.debugLogger.extend(this.wait.name)

		debug(`Waiting <${count}> milliseconds`)

		return new Promise((resolve) => setTimeout(resolve, count))
	}

	public parseKeyValue(input: string): [string, string] {
		const matchRegex = /^\s*([\w\\.\\-\s]+)\s*=\s*(.*)?\s*$/

		const match: RegExpMatchArray | null = input.match(matchRegex)

		if (match === null) {
			throw new Error(`Unable to parse <${input}> input`)
		}

		const key = match[1].trim()
		const value = match[2] ? match[2].trim() : ""

		return [key, value]
	}
}
