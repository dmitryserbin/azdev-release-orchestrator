import "mocha"
import assert from "assert"
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger"
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator"
import { CommonHelper } from "../../helpers/commonhelper"
import { It, Mock } from "typemoq"

describe("CommonHelper", async () => {
	const debugLoggerMock = Mock.ofType<IDebugLogger>()
	const debugCreatorMock = Mock.ofType<IDebugCreator>()
	debugCreatorMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)
	debugLoggerMock.setup((x) => x.extend(It.isAnyString())).returns(() => debugLoggerMock.target)

	const commonHelper = new CommonHelper(debugCreatorMock.object)

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

			assert.notStrictEqual(result, null, "Result is null")
			assert.strictEqual(result[0], expected[0], `Expected key: ${expected[0]}, Actual key: ${result[0]}`)
			assert.strictEqual(result[1], expected[1], `Expected value: ${expected[1]}, Actual value: ${result[1]}`)

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

		assert.throws(() => commonHelper.parseKeyValue(keyValueMock), "Error not thrown")

		//#endregion
	})
})

process.on("unhandledRejection", (error: unknown) => {
	console.error(error)
	process.exit(1)
})
