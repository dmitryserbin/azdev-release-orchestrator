import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IReporter } from "../interfaces/orchestrator/reporter";

export class Reporter implements IReporter {

    private debugLogger: IDebugLogger;

    constructor(debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

    }

}
