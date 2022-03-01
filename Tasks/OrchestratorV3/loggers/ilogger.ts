/* eslint-disable @typescript-eslint/no-explicit-any */

import { IDebug } from "./idebug";

export interface ILogger {

    log(message: any): void;
    warn(message: any): void;
    extend(name: string): IDebug;

}
