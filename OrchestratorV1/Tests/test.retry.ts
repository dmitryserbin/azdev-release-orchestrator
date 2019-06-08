import "mocha";

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

import { IRetryOptions, Retry } from "../retry";

describe("Retry", () => {

    let count: number = 0;
    const options: IRetryOptions = { attempts: 3, timeout: 1000 };

    const consoleLog = console.log;

    class RetryThis {

        @Retry({ attempts: options.attempts, timeout: options.timeout })
        public static async decoratorRetryPass() {

            console.log(`Retrying for the ${count++} time at ${new Date().toLocaleTimeString()}`);

            if (count === 1) {

                throw new Error("Ooops!");

            }

        }

        @Retry({ attempts: options.attempts, timeout: options.timeout })
        public static async decoratorRetryFail() {

            console.log(`Retrying for the ${count++} time at ${new Date().toLocaleTimeString()}`);

            throw new Error("Ooops!");

        }
    }

    beforeEach(() => {

        count = 0;

    });

    it("Should decorator retry and pass", async () => {

        // Hide console output
        console.log = () => { /**/ };

        await chai.expect(RetryThis.decoratorRetryPass()).not.to.be.rejected;

        // Restore console output
        console.log = consoleLog;

    });

    it("Should decorator retry and fail", async () => {

        // Hide console output
        console.log = () => { /**/ };

        await chai.expect(RetryThis.decoratorRetryFail()).to.be.rejected;

        // Restore console output
        console.log = consoleLog;

    });

});
