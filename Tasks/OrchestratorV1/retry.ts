import Debug from "debug";

const logger = Debug("release-orchestrator:Retry");

export interface IRetryOptions {

    attempts: number;
    timeout: number;

}

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

                return await retryAsync.apply(this, [originalMethod, args, options.attempts, options.timeout]);

            } catch (e) {

                e.message = `Failed retrying <${name}> for <${options.attempts}> times. ${e.message}`;

                throw e;

            }
        };

        return descriptor;

    };

}

// tslint:disable-next-line:ban-types
async function retryAsync(target: Function, args: any[], attempts: number, timeout: number): Promise<any> {

    const verbose = logger.extend("retryAsync");

    try {

        // @ts-ignore
        return await target.apply(this, args);

    } catch (e) {

        if (--attempts < 0) {

            throw new Error(e);

        }

        verbose(`Retrying <${target.name}> in <${timeout / 1000}> seconds`);

        await new Promise((resolve) => setTimeout(resolve, timeout));

        // @ts-ignore
        return retryAsync.apply(this, [target, args, attempts, timeout]);

    }

}
