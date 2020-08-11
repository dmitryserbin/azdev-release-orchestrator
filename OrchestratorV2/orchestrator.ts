import { TaskResult, getBoolInput, setResult } from "azure-pipelines-task-lib/task";

import { IEndpoint } from "./interfaces/task/endpoint";
import { IParameters } from "./interfaces/task/parameters";
import { ITaskHelper } from "./interfaces/helpers/taskhelper";
import { TaskHelper } from "./helpers/taskhelper";
import { IDebugLogger } from "./interfaces/common/debuglogger";
import { DebugLogger } from "./common/debuglogger";
import { ConsoleLogger } from "./common/consolelogger";
import { IConsoleLogger } from "./interfaces/common/consolelogger";
import { IDetails } from "./interfaces/task/details";
import { IApiFactory } from "./interfaces/factories/apifactory";
import { ApiFactory } from "./factories/apifactory";
import { IOrchestratorFactory } from "./interfaces/factories/orchestratorfactory";
import { OrchestratorFactory } from "./factories/orchestratorfactory";
import { IDeployer } from "./interfaces/deployer/deployer";
import { IOrchestrator } from "./interfaces/orchestrator/orchestrator";
import { Orchestrator } from "./orchestrator/orchestrator";

async function run() {

    const debugLogger: IDebugLogger = new DebugLogger("release-orchestrator");
    const consoleLogger: IConsoleLogger = new ConsoleLogger();

    const taskHelper: ITaskHelper = new TaskHelper(debugLogger);

    try {

        const endpoint: IEndpoint = await taskHelper.getEndpoint();
        const parameters: IParameters = await taskHelper.getParameters();
        const details: IDetails = await taskHelper.getDetails();

        const apiFactory: IApiFactory = new ApiFactory(endpoint.account, endpoint.token, debugLogger);
        const orchestratorFactory: IOrchestratorFactory = new OrchestratorFactory(apiFactory, debugLogger, consoleLogger);
        const deployer: IDeployer = await orchestratorFactory.createDeployer();
        const orchestrator: IOrchestrator = new Orchestrator(deployer, debugLogger, consoleLogger);

        await orchestrator.orchestrateRelease(parameters, details);

    } catch (err) {

        const result: TaskResult = getBoolInput("IgnoreFailure")
            ? TaskResult.SucceededWithIssues : TaskResult.Failed;

        setResult(result, err.message);

    }

}

run();
