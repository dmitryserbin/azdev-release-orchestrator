import "mocha";

import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";
import * as ba from "azure-devops-node-api/BuildApi";

import { IHelper, IConnection, IEndpoint, IDeployer } from "../interfaces";
import { Helper } from "../helper";
import { Connection } from "../connection";
import { Deployer } from "../deployer";

describe("Helper", () => {

    const connection: IConnection = new Connection({

        url: process.env.azUrl ? process.env.azUrl : "http://my-azdev-url",
        token: process.env.azToken ? process.env.azToken : "My-Token"

    } as IEndpoint);

    it("Helper @manual", async () => {

        const coreApi: ca.CoreApi = await connection.getCoreApi();
        const releaseApi: ra.ReleaseApi = await connection.getReleaseApi();
        const buildApi: ba.BuildApi = await connection.getBuildApi();
        const helper: IHelper = new Helper(coreApi, releaseApi, buildApi);
        const deployer: IDeployer = new Deployer(releaseApi);

    });

});
