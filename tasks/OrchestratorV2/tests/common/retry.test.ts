/* eslint-disable @typescript-eslint/no-explicit-any */

import "mocha"
import assert from "assert"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { DebugCreator } from "../../loggers/debugcreator"
import { IRetryThis, RetryThis } from "./retrythis"

const debugCreator: IDebugCreator = new DebugCreator("release-orchestrator")

describe("Retryable", () => {
	it("Should pass immediately", async () => {
		//#region ARRANGE

		const retryCount: number = 0
		const retryThis: IRetryThis = new RetryThis(debugCreator)

		//#endregion

		//#region ACT & ASSERT

		await assert.doesNotReject(async () => retryThis.retry(retryCount), "Should pass immediately")

		//#endregion
	})

	it("Should retry and pass", async () => {
		//#region ARRANGE

		const retryCount: number = 3
		const retryThis: IRetryThis = new RetryThis(debugCreator)

		//#endregion

		//#region ACT & ASSERT

		await assert.doesNotReject(async () => retryThis.retry(retryCount), "Should retry and pass")

		//#endregion
	})

	it("Should retry and fail", async () => {
		//#region ARRANGE

		const retryCount: number = 10
		const retryThis: IRetryThis = new RetryThis(debugCreator)

		//#endregion

		//#region ACT & ASSERT

		await assert.rejects(async () => retryThis.retry(retryCount), "Should retry and fail")

		//#endregion
	})

	it("Should retry empty and pass", async () => {
		//#region ARRANGE

		const retryCount: number = 3
		const retryThis: IRetryThis = new RetryThis(debugCreator)

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
		const retryThis: IRetryThis = new RetryThis(debugCreator)

		//#endregion

		//#region ACT & ASSERT

		await assert.rejects(async () => retryThis.retry(retryCount), "Should retry and fail")

		//#endregion
	})
})
