import "mocha";

import * as chai from "chai";

import { Connection } from "../connection";
import { IConnection, IEndpoint } from "../interfaces";

describe("Connection", () => {

    const url = "https://my-endpoint";
    const token = "My-Secret-Token";

    it("Should create new connection", async () => {

        const endpoint = {

            url,
            token,

        } as IEndpoint;

        const connection: IConnection = new Connection(endpoint);

        chai.expect(connection).to.not.eq(null);

    });

});
