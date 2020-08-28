import "mocha";

import { use, expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { DebugCreator } from "../../loggers/debugcreator";
import { RetryThis, IRetryThis } from "./retrythis";

const debugCreator: IDebugCreator = new DebugCreator("release-orchestrator");

describe("Retryable", () => {

    use(chaiAsPromised);

    it("Should pass immediately", async () => {

        // Arrange
        const retryCount: number = 0;
        const retryThis: IRetryThis = new RetryThis(0, debugCreator);

        // Act & Assert
        await expect(retryThis.retry(retryCount)).not.to.be.rejected;

    });

    it("Should retry and pass", async () => {

        // Arrange
        const retryCount: number = 3;
        const retryThis: IRetryThis = new RetryThis(0, debugCreator);

        // Act & Assert
        await expect(retryThis.retry(retryCount)).not.to.be.rejected;

    });

    it("Should retry and fail", async () => {

        // Arrange
        const retryCount: number = 10;
        const retryThis: IRetryThis = new RetryThis(0, debugCreator);

        // Act & Assert
        await expect(retryThis.retry(retryCount)).to.be.rejected;

    });

});
