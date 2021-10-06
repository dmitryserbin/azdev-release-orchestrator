import { IApprover } from "../interfaces/orchestrator/approver";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";

export class Approver implements IApprover {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    constructor(debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

    }

}
