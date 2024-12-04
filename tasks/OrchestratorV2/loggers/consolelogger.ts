/* eslint-disable @typescript-eslint/no-explicit-any */

import { IConsoleLogger } from "../interfaces/loggers/iconsolelogger"

export class ConsoleLogger implements IConsoleLogger {
	public log(message: any): void {
		console.log(message)
	}

	public warn(message: any): void {
		console.warn(message)
	}
}
