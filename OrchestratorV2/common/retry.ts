/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { DebugCreator } from "../loggers/debugcreator";

const debugCreator: IDebugCreator = new DebugCreator("release-orchestrator");
const debugLogger: IDebugLogger = debugCreator.extend("Retry");

export function Retryable(attempts: number = 12, timeout: number = 5000): Function {

    const debug = debugLogger.extend("retryable");

    return function(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {

        const originalMethod: Function = descriptor.value;

        descriptor.value = async function(...args: any[]) {

            try {

                debug(`Executing <${propertyKey}> with <${attempts}> retries`);

                return await retryAsync.apply(this, [originalMethod, args, attempts, timeout]);

            } catch (e) {

                e.message = `Failed retrying <${name}> for <${attempts}> times. ${e.message}`;

                throw e;

            }
        };

        return descriptor;

    };

}

async function retryAsync(target: Function, args: any[], attempts: number, timeout: number): Promise<any> {

    const debug = debugLogger.extend("retryAsync");

    try {

        // @ts-ignore
        return await target.apply(this, args);

    } catch (e) {

        if (--attempts < 0) {

            throw new Error(e);

        }

        debug(`Retrying <${target.name}> in <${timeout / 1000}> seconds`);

        await new Promise((resolve) => setTimeout(resolve, timeout));

        // @ts-ignore
        return retryAsync.apply(this, [target, args, attempts, timeout]);

    }

}
