import "mocha";

import * as ba from "azure-devops-node-api/BuildApi";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";

import { Connection } from "../connection";
import { Deployer } from "../deployer";
import { Helper } from "../helper";
import { IConnection, IDeployer, IEndpoint, IHelper, IOrchestrator, IParameters, IReleaseDetails, ReleaseType } from "../interfaces";
import { Orchestrator } from "../orchestrator";

describe("Helper", () => {

    const connection: IConnection = new Connection({

        url: process.env.azUrl ? process.env.azUrl : "http://my-azdev-url",
        token: process.env.azToken ? process.env.azToken : "My-Token",

    } as IEndpoint);

    it("Helper @manual", async () => {

        const parameters = {

            projectId: "761623f0-c4c0-4dab-884b-a428a01c200f",
            definitionId: "1",
            releaseId: "",
            releaseType: ReleaseType.Create,
            stages: [ "DEV", "TEST", "PROD" ],

        } as IParameters;

        const details = {

            endpointName: "My-Endpoint",
            projectName: "My-Orchestrator-Project",
            releaseName: "My-Orchestrator-Release",
            requesterName: "My-Name",
            requesterId: "1",

        } as IReleaseDetails;

        const coreApi: ca.CoreApi = await connection.getCoreApi();
        const releaseApi: ra.ReleaseApi = await connection.getReleaseApi();
        const buildApi: ba.BuildApi = await connection.getBuildApi();
        const helper: IHelper = new Helper(coreApi, releaseApi, buildApi);
        const deployer: IDeployer = new Deployer(helper);
        const orchestrator: IOrchestrator = new Orchestrator(helper, deployer);

        await orchestrator.deployRelease(parameters, details);

    });

});
