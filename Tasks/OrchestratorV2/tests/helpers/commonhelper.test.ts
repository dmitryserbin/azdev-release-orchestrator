import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger";
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator";
import { CommonHelper } from "../../helpers/commonhelper";

describe("CommonHelper", async () => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const commonHelper = new CommonHelper(debugCreatorMock.object);

    const tests = [

        { mock: "mykey=myvalue", expected: [ "mykey", "myvalue" ] },
        { mock: "my-key=my-value", expected: [ "my-key", "my-value" ] },
        { mock: "my-key=123", expected: [ "my-key", "123" ] },
        { mock: "my-key = my-value", expected: [ "my-key", "my-value" ] },
        { mock: "mykey=my value", expected: [ "mykey", "my value" ] },
        { mock: "my key=myvalue", expected: [ "my key", "myvalue" ] },
        { mock: "my key=my value", expected: [ "my key", "my value" ] },
        { mock: "my key  =  my value  ", expected: [ "my key", "my value" ] },
        { mock: "mykey=", expected: [ "mykey", "" ] },

    ];

    tests.forEach(({ mock, expected }) => {

        it(`Should parse '${mock}' pair`, () => {

            //#region ACT

            const result = commonHelper.parseKeyValue(mock);

            //#endregion

            //#region ASSERT

            chai.expect(result).to.not.eq(null);
            chai.expect(result[0]).to.eq(expected[0]);
            chai.expect(result[1]).to.eq(expected[1]);

            //#endregion

        });

    });

    it("Should throw parsing key value pair", () => {

        //#region ARRANGE

        const keyMock = "my-key";
        const valueMock = "my-value";

        const keyValueMock = `${keyMock}:${valueMock}`;

        //#endregion

        //#region ACT & ASSERT

        chai.expect(() => commonHelper.parseKeyValue(keyValueMock)).to.throw();

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
