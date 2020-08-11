
import Debug from "debug";

import { IDebugLogger } from "../interfaces/common/debuglogger";

export class DebugLogger implements IDebugLogger {

    private debugLogger: Debug.Debugger;

    constructor(name: string) {

        this.debugLogger = Debug(name);

    }

    public create(name: string): Debug.Debugger {

        return this.debugLogger.extend(name);

    }

}
