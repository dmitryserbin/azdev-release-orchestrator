import { IMonitor } from "../interfaces/orchestrator/monitor";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";

export class Monitor implements IMonitor {

    private debugLogger: IDebugLogger;

    constructor(debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

    }

}
