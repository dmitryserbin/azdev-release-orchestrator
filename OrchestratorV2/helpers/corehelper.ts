import Debug from "debug";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { ICoreHelper } from "../interfaces/helpers/corehelper";

export class CoreHelper implements ICoreHelper {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

}
