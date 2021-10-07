import { IProgressMonitor } from "./iprogressmonitor";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";

export class ProgressMonitor implements IProgressMonitor {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

}
