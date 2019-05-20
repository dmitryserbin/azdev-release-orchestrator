import Debug from "debug";

import { IRetryOptions } from "./interfaces";

const logger = Debug("release-orchestrator:Retry");

// tslint:disable-next-line:ban-types
export function Retry(options: IRetryOptions = { attempts: 10, timeout: 5000 }): Function {

    const verbose = logger.extend("retry");

    // tslint:disable-next-line:only-arrow-functions ban-types
    return function(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {

        // tslint:disable-next-line:ban-types
        const originalMethod: Function = descriptor.value;

        descriptor.value = async function(...args: any[]) {

            try {

                verbose(`Executing <${propertyKey}> with <${options.attempts}> retries`);

                return await retryAsync.apply(this, [originalMethod, args, options]);

            } catch (e) {

                e.message = `Failed retrying <${name}> for <${options.attempts}> times. ${e.message}`;

                throw e;

            }
        };

        return descriptor;

    };

}

// tslint:disable-next-line:ban-types
export async function retryAsync(target: Function, args: any[], options: IRetryOptions = { attempts: 10, timeout: 5000 }): Promise<any> {

    const verbose = logger.extend("retryAsync");

    try {

        return await target.apply(this, args);

    } catch (e) {

        if (--options.attempts < 0) {

            throw new Error(e);

        }

        verbose(`Retrying <${target.name}> in <${options.timeout / 1000}> seconds`);

        await new Promise((resolve) => setTimeout(resolve, options.timeout));

        return retryAsync.apply(this, [target, args, { attempts: options.attempts, timeout: options.timeout }]);

    }

}
