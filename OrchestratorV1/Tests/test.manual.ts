import "mocha";

import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";

import { IHelper, IConnection, IEndpoint } from "../interfaces";
import { Helper } from "../helper";
import { Connection } from "../connection";

describe("Helper", () => {

    const connection: IConnection = new Connection({

        url: process.env.azUrl,
        token: process.env.azToken

    } as IEndpoint);

    it("Helper @manual", async () => {

        const coreApi: ca.CoreApi = await connection.getCoreApi();
        const releaseApi: ra.ReleaseApi = await connection.getReleaseApi();
        const helper: IHelper = new Helper(coreApi, releaseApi);

    });

});
