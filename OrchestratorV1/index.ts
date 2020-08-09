import * as tl from "azure-pipelines-task-lib/task";

import * as ba from "azure-devops-node-api/BuildApi";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";

import { getEndpoint, getParameters, getReleaseDetails } from "./azdev";
import { Connection } from "./connection";
import { Deployer } from "./deployer";
import { Helper } from "./helper";
import { IConnection, IDeployer, IEndpoint, IHelper, IOrchestrator, IParameters, IReleaseDetails } from "./interfaces";
import { Orchestrator } from "./orchestrator";

async function run() {

    try {

        // Get endpoint
        const endpoint: IEndpoint = getEndpoint();

        // Get parameters
        const parameters: IParameters = getParameters();
        const details: IReleaseDetails = getReleaseDetails();

        // Create connection
        const connection: IConnection = new Connection(endpoint);
        const coreApi: ca.CoreApi = await connection.getCoreApi();
        const releaseApi: ra.ReleaseApi = await connection.getReleaseApi();
        const buildApi: ba.BuildApi = await connection.getBuildApi();

        const helper: IHelper = new Helper(coreApi, releaseApi, buildApi);
        const deployer: IDeployer = new Deployer(helper);
        const orchestrator: IOrchestrator = new Orchestrator(helper, deployer);

        // Run orchestrator
        await orchestrator.deployRelease(parameters, details);

    } catch (err) {

        // Get task result status
        const taskResult: tl.TaskResult = tl.getBoolInput("IgnoreFailure") ? tl.TaskResult.SucceededWithIssues : tl.TaskResult.Failed;

        tl.setResult(taskResult, err.message);

    }

}

run();
