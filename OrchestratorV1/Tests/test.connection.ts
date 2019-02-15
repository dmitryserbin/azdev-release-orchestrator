import "mocha";

import * as chai from "chai";

import { IConnection, IEndpoint } from "../interfaces";
import { Connection } from "../connection";

describe("Connection", () => {

    const url = "https://my-endpoint";
    const token = "My-Secret-Token";

    it("Should create new connection", async () => {

        const endpoint = {

            url: url,
            token: token,

        } as IEndpoint;

        const connection: IConnection = new Connection(endpoint);

        chai.expect(connection).not.null;

    });

});
