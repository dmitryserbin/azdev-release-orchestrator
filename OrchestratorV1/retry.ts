import { IRetryOptions } from "./interfaces";

// tslint:disable-next-line:ban-types
export function Retry(options: IRetryOptions = { attempts: 10, timeout: 5000 }): Function {

    // tslint:disable-next-line:only-arrow-functions
    return function(target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {

        const originalMethod: any = descriptor.value;

        descriptor.value = async function(...args: any[]) {

            try {

                return await retryAsync.apply(this, [originalMethod, args, options]);

            } catch (e) {

                e.message = `Failed retrying <${name}> for <${options.attempts}> times`;

                throw e;

            }
        };

        return descriptor;

    };

}

// tslint:disable-next-line:ban-types
export async function retryAsync(target: Function, args: any[], options: IRetryOptions = { attempts: 10, timeout: 5000 }): Promise<any> {

    try {

        return await target.apply(target, args);

    } catch (e) {

        if (--options.attempts < 0) {

            throw new Error(e);

        }

        await new Promise((resolve) => setTimeout(resolve, options.timeout));

        return retryAsync.apply(target, [target, args, { attempts: options.attempts, timeout: options.timeout }]);

    }

}
