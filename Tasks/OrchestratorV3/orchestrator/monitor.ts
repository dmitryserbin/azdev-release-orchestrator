import { IMonitor } from "../interfaces/orchestrator/monitor";
import { IDebug } from "../interfaces/loggers/debug";
import { ILogger } from "../interfaces/loggers/logger";

export class Monitor implements IMonitor {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

}
