import tl = require("azure-pipelines-task-lib/task");

import * as ba from "azure-devops-node-api/BuildApi";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";

import { getCancelParameters, getEndpoint, getReleaseDetails, getJobStatus } from "./azdev";
import { Connection } from "./connection";
import { Deployer } from "./deployer";
import { Helper } from "./helper";
import { IConnection, IDeployer, IEndpoint, IHelper, IOrchestrator, IReleaseParameters, IReleaseDetails } from "./interfaces";
import { Orchestrator } from "./orchestrator";

async function run() {

    try {

        const status: string = getJobStatus();
        const release: IReleaseParameters = getCancelParameters();

        // No release cancellation required
        if (status !== "Canceled" && !release.projectName && !release.releaseId) {

            return

        }

        // Get details
        const details: IReleaseDetails = getReleaseDetails();

        // Get endpoint
        const endpoint: IEndpoint = getEndpoint();

        // Create connection
        const connection: IConnection = new Connection(endpoint);
        const coreApi: ca.CoreApi = await connection.getCoreApi();
        const releaseApi: ra.ReleaseApi = await connection.getReleaseApi();
        const buildApi: ba.BuildApi = await connection.getBuildApi();

        const helper: IHelper = new Helper(coreApi, releaseApi, buildApi);
        const deployer: IDeployer = new Deployer(helper);
        const orchestrator: IOrchestrator = new Orchestrator(helper, deployer);

        // Cancel active relese
        await orchestrator.cancelRelease(release, details);

    } catch (err) {

        tl.setResult(tl.TaskResult.Failed, err.message);

    }

}

run();
