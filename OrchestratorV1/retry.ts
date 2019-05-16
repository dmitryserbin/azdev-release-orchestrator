import { IOptions } from "./interfaces";

// tslint:disable-next-line:ban-types
export function Retry(options: IOptions): Function {

    // tslint:disable-next-line:only-arrow-functions
    return function(target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {

        const originalMethod: any = descriptor.value;

        descriptor.value = async function(...args: any[]) {

            try {

                return await retryAsync.apply(this, [originalMethod, args, options.retryCount, options.retryTimeout]);

            } catch (e) {

                e.message = `Failed retrying ${name} for ${options.retryCount} times`;

                throw e;

            }
        };

        return descriptor;

    };

    // tslint:disable-next-line:ban-types
    async function retryAsync(target: Function, args: any[], retryCount: number, retryTimeout: number): Promise<any> {

        try {

            return await target.apply(target, args);

        } catch (e) {

            if (--retryCount < 0) {

                throw new Error(e);

            }

            // Sleep before retry
            await new Promise((resolve) => setTimeout(resolve, retryTimeout));

            return retryAsync.apply(target, [target, args, retryCount, retryTimeout]);

        }

    }

}
