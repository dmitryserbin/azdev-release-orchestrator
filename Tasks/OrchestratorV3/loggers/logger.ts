/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import Debug from "debug";
import { IDebug } from "../interfaces/loggers/debug";

import { ILogger } from "../interfaces/loggers/logger";

export class Logger implements ILogger {

    private debugLogger: IDebug;

    constructor(name: string) {

        this.debugLogger = Debug(name);

    }

    public log(message: any): void {

        console.log(message);

    }

    public warn(message: any): void {

        console.warn(message);

    }

    public extend(name: string): IDebug {

        return this.debugLogger.extend(name);

    }

}
