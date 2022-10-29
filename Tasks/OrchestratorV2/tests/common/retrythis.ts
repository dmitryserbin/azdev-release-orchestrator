/* eslint-disable @typescript-eslint/no-explicit-any */

import { Retryable } from "../../common/retry";
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger";
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator";

export interface IRetryThis {

    retry(failTimes: number): Promise<number>;
    retryEmpty(failTimes: number): Promise<number>;

}

export class RetryThis implements IRetryThis {

    private debugLogger: IDebugLogger;

    private attempt: number = 0;

    constructor(debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

    }

    @Retryable(5, 100)
    public async retry(failAttempts: number): Promise<number> {

        const debug = this.debugLogger.extend("retry");

        this.attempt++;

        debug(`Executing <${this.attempt}/${failAttempts}> attempt`);

        if (this.attempt < failAttempts) {

            throw new Error("Ooops!");

        }

        return this.attempt;

    }

    @Retryable(5, 100, true)
    public async retryEmpty(failAttempts: number): Promise<any> {

        const debug = this.debugLogger.extend("retryEmpty");

        this.attempt++;

        debug(`Executing <${this.attempt}/${failAttempts}> attempt`);

        if (this.attempt < failAttempts) {

            return null;

        }

        return this.attempt;

    }

}
