import Debug from "debug";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";

export class BuildHelper implements IBuildHelper {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

}
