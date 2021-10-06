import { IParameters } from "../interfaces/task/parameters";
import { IDetails } from "../interfaces/task/details";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { ICreator } from "../interfaces/orchestrator/creator";
import { IReleaseJob } from "../interfaces/common/releasejob";

export class Creator implements ICreator {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    constructor(debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

    }

    public async createJob(parameters: IParameters, details: IDetails): Promise<IReleaseJob> {

        const debug = this.debugLogger.extend(this.createJob.name);

        return {} as IReleaseJob;

    }

}
