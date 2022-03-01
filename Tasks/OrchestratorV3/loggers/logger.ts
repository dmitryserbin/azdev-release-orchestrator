/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import Debug from "debug";

import { IDebug } from "./idebug";
import { ILogger } from "./ilogger";

export class Logger implements ILogger {

    private debugLogger: IDebug;

    constructor(name: string, force: boolean = false) {

        this.debugLogger = Debug(name);

        if (force) {

            Debug.enable(`${name}:*`);

        }

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
