import { IEndpoint } from "./interfaces/task/endpoint";
import { IParameters } from "./interfaces/task/parameters";
import { ITaskHelper } from "./interfaces/helpers/taskhelper";
import { TaskHelper } from "./helpers/taskhelper";
import { IDebugCreator } from "./interfaces/loggers/debugcreator";
import { DebugCreator } from "./loggers/debugcreator";
import { ConsoleLogger } from "./loggers/consolelogger";
import { IConsoleLogger } from "./interfaces/loggers/consolelogger";
import { IDetails } from "./interfaces/task/details";
import { IOrchestrator } from "./interfaces/orchestrator/orchestrator";
import { Orchestrator } from "./orchestrator/orchestrator";
import { IReleaseProgress } from "./interfaces/common/releaseprogress";
import { IApiFactory } from "./interfaces/factories/apifactory";
import { ApiFactory } from "./factories/apifactory";
import { IOrchestratorFactory } from "./interfaces/factories/orchestratorfactory";
import { OrchestratorFactory } from "./factories/orchestratorfactory";

async function run() {

    const debugCreator: IDebugCreator = new DebugCreator("release-orchestrator");
    const consoleLogger: IConsoleLogger = new ConsoleLogger();

    const taskHelper: ITaskHelper = new TaskHelper(debugCreator);

    try {

        const endpoint: IEndpoint = await taskHelper.getEndpoint();
        const parameters: IParameters = await taskHelper.getParameters();
        const details: IDetails = await taskHelper.getDetails();

        const apiFactory: IApiFactory = new ApiFactory(endpoint, debugCreator);
        const orchestratorFactory: IOrchestratorFactory = new OrchestratorFactory(apiFactory, debugCreator, consoleLogger);

        const orchestrator: IOrchestrator = new Orchestrator(orchestratorFactory, debugCreator, consoleLogger);

        // Run orchestrator
        const releaseProgress: IReleaseProgress = await orchestrator.orchestrate(parameters, details);

        await taskHelper.validate(releaseProgress.status);

    } catch (error) {

        await taskHelper.fail(error.message);

    }

}

run();
