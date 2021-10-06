import { IApprover } from "../interfaces/orchestrator/approver";
import { IDebug } from "../interfaces/loggers/debug";
import { ILogger } from "../interfaces/loggers/logger";

export class Approver implements IApprover {

    private logger: ILogger;
    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

    }

}
