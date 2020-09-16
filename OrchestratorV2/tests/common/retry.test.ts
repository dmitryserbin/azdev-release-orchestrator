import "mocha";

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { DebugCreator } from "../../loggers/debugcreator";
import { RetryThis, IRetryThis } from "./retrythis";

const debugCreator: IDebugCreator = new DebugCreator("release-orchestrator");

describe("Retryable", () => {

    chai.use(chaiAsPromised);

    it("Should pass immediately", async () => {

        //#region ARRANGE

        const retryCount: number = 0;
        const retryThis: IRetryThis = new RetryThis(0, debugCreator);

        //#endregion

        //#region ACT & ASSERT

        await chai.expect(retryThis.retry(retryCount)).not.to.be.rejected;

        //#endregion

    });

    it("Should retry and pass", async () => {

        //#region ARRANGE

        const retryCount: number = 3;
        const retryThis: IRetryThis = new RetryThis(0, debugCreator);

        //#endregion

        //#region ACT & ASSERT

        await chai.expect(retryThis.retry(retryCount)).not.to.be.rejected;

        //#endregion

    });

    it("Should retry and fail", async () => {

        //#region ARRANGE

        const retryCount: number = 10;
        const retryThis: IRetryThis = new RetryThis(0, debugCreator);

        //#endregion

        //#region ACT & ASSERT

        await chai.expect(retryThis.retry(retryCount)).to.be.rejected;

        //#endregion

    });

});
