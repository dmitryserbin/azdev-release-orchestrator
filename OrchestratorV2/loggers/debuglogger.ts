
import Debug from "debug";

import { IDebugLogger, IDebugger } from "../interfaces/loggers/debuglogger";

export class DebugLogger implements IDebugLogger {

    private debugLogger: IDebugger;

    constructor(name: string) {

        this.debugLogger = Debug(name);

    }

    public create(name: string): IDebugger {

        return this.debugLogger.extend(name);

    }

}
