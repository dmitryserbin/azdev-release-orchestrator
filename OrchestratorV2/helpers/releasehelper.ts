import Debug from "debug";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";

export class ReleaseHelper implements IReleaseHelper {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

}
