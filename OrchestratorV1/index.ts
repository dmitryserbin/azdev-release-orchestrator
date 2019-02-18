import tl = require("azure-pipelines-task-lib/task");

import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";

import { IEndpoint, IParameters, IOrchestrator, IConnection, IHelper, IDeployer, IReleaseDetails } from "./interfaces";
import { getEndpoint, getParameters, getReleaseDetails } from "./azdev";
import { Orchestrator } from "./orchestrator";
import { Connection } from "./connection";
import { Helper } from "./helper";
import { Deployer } from "./deployer";

async function run() {

    try {

        // Get endpoint
        const endpoint: IEndpoint = await getEndpoint();

        // Get parameters
        const parameters: IParameters = await getParameters();
        const details: IReleaseDetails = await getReleaseDetails();

        // Create connection
        const connection: IConnection = new Connection(endpoint);
        const coreApi: ca.CoreApi = await connection.getCoreApi();
        const releaseApi: ra.ReleaseApi = await connection.getReleaseApi();

        const helper: IHelper = new Helper(coreApi, releaseApi);
        const deployer: IDeployer = new Deployer(releaseApi);
        const orchestrator: IOrchestrator = new Orchestrator(helper, deployer);

        // Run orchestrator
        await orchestrator.deployRelease(parameters, details);

    } catch (err) {

        // Get task result status
        const taskResult = tl.getBoolInput("IgnoreFailure") ? tl.TaskResult.SucceededWithIssues : tl.TaskResult.Failed;

        tl.setResult(taskResult, err.message);

    }

}

run();
