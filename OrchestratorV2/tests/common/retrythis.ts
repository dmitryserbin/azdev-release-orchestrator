import { Retryable } from "../../common/retry";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { IDebugCreator } from "../../interfaces/loggers/debugcreator";

export interface IRetryThis {

    retry(failTimes: number): Promise<number>;

}

export class RetryThis implements IRetryThis {

    private debugLogger: IDebugLogger;

    private count: number;

    constructor(count: number, debugCreator: IDebugCreator) {

        this.count = count;
        this.debugLogger = debugCreator.extend(this.constructor.name);

    }

    @Retryable({ attempts: 5, timeout: 100 })
    public async retry(failTimes: number): Promise<number> {

        const debug = this.debugLogger.extend("retry");

        this.count++;

        debug(`Executing <retry> method <${this.count}> time`);

        if (this.count <= failTimes) {

            throw new Error("Ooops!");

        }

        return this.count;

    }

}

