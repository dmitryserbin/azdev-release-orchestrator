import "mocha";

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

import { IRetryOptions } from "../interfaces";
import { Retry } from "../retry";

describe("Helper", () => {

    let count: number = 1;

    const options: IRetryOptions = { attempts: 3, timeout: 1000 };

    const consoleLog = console.log;

    class RetryThis {

        @Retry(options)
        public static async failRetry() {

            console.log(`Retrying for the ${count++} time at ${new Date().toLocaleTimeString()}`);

            throw new Error("Ooops!");

        }

    }

    it("Should retry and fail", async () => {

        // Hide console output
        console.log = () => { /**/ };

        await chai.expect(RetryThis.failRetry()).to.be.rejected;

        // Restore console output
        console.log = consoleLog;

    });

});
