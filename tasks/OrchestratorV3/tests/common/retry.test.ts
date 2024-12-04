/* eslint-disable @typescript-eslint/no-explicit-any */

import "mocha"
import { IRetryThis, RetryThis } from "./retrythis"
import { ILogger } from "../../loggers/ilogger"
import { Logger } from "../../loggers/logger"
import assert from "assert"

const logger: ILogger = new Logger("release-orchestrator")

describe("Retryable", () => {
	it("Should pass immediately", async () => {
		//#region ARRANGE

		const retryCount: number = 0
		const retryThis: IRetryThis = new RetryThis(logger)

		//#endregion

		//#region ACT & ASSERT

		await assert.doesNotReject(retryThis.retry(retryCount), "Retry should not be rejected")

		//#endregion
	})

	it("Should retry and pass", async () => {
		//#region ARRANGE

		const retryCount: number = 3
		const retryThis: IRetryThis = new RetryThis(logger)

		//#endregion

		//#region ACT & ASSERT

		await assert.doesNotReject(retryThis.retry(retryCount), "Retry should not be rejected")

		//#endregion
	})

	it("Should retry and fail", async () => {
		//#region ARRANGE

		const retryCount: number = 10
		const retryThis: IRetryThis = new RetryThis(logger)

		//#endregion

		//#region ACT & ASSERT

		await assert.rejects(retryThis.retry(retryCount), "Retry should be rejected")

		//#endregion
	})

	it("Should retry empty and pass", async () => {
		//#region ARRANGE

		const retryCount: number = 3
		const retryThis: IRetryThis = new RetryThis(logger)

		//#endregion

		//#region ACT & ASSERT

		const result: any = await retryThis.retryEmpty(retryCount)

		assert.notStrictEqual(result, null, "Result should not be null")
		assert.strictEqual(result, 3, "Result should be 3")

		//#endregion
	})

	it("Should retry empty and fail", async () => {
		//#region ARRANGE

		const retryCount: number = 6
		const retryThis: IRetryThis = new RetryThis(logger)

		//#endregion

		//#region ACT & ASSERT

		await assert.rejects(retryThis.retryEmpty(retryCount), "Retry should be rejected")

		//#endregion
	})
})
