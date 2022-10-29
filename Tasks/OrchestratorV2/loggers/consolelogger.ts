/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { IConsoleLogger } from "../interfaces/loggers/iconsolelogger";

export class ConsoleLogger implements IConsoleLogger {

    constructor() { /* */ }

    public log(message: any): void {

        console.log(message);

    }

    public warn(message: any): void {

        console.warn(message);

    }

}
