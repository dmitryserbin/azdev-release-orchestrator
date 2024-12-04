import "mocha"

import { ILogger } from "../../loggers/ilogger"
import { CommonHelper } from "../../helpers/commonhelper/commonhelper"
import assert from "assert"
import { Mock } from "typemoq"

describe("CommonHelper", async () => {
	const loggerMock = Mock.ofType<ILogger>()

	const commonHelper = new CommonHelper(loggerMock.object)

	const tests = [
		{ mock: "mykey=myvalue", expected: ["mykey", "myvalue"] },
		{ mock: "my-key=my-value", expected: ["my-key", "my-value"] },
		{ mock: "my-key=123", expected: ["my-key", "123"] },
		{ mock: "my-key = my-value", expected: ["my-key", "my-value"] },
		{ mock: "mykey=my value", expected: ["mykey", "my value"] },
		{ mock: "my key=myvalue", expected: ["my key", "myvalue"] },
		{ mock: "my key=my value", expected: ["my key", "my value"] },
		{ mock: "my key  =  my value  ", expected: ["my key", "my value"] },
		{ mock: "mykey=", expected: ["mykey", ""] },
	]

	tests.forEach(({ mock, expected }) => {
		it(`Should parse '${mock}' pair`, () => {
			//#region ACT

			const result = commonHelper.parseKeyValue(mock)

			//#endregion

			//#region ASSERT

			assert.notStrictEqual(result, null, "Result should not be null")
			assert.strictEqual(result[0], expected[0], "Key should match")
			assert.strictEqual(result[1], expected[1], "Value should match")

			//#endregion
		})
	})

	it("Should throw parsing key value pair", () => {
		//#region ARRANGE

		const keyMock = "my-key"
		const valueMock = "my-value"

		const keyValueMock = `${keyMock}:${valueMock}`

		//#endregion

		//#region ACT & ASSERT

		assert.throws(() => commonHelper.parseKeyValue(keyValueMock), "Parsing should throw an error")

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
