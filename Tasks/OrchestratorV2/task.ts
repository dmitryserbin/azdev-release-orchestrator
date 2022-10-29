/* eslint-disable @typescript-eslint/no-explicit-any */

import { IEndpoint } from "./interfaces/task/iendpoint";
import { IParameters } from "./interfaces/task/iparameters";
import { ITaskHelper } from "./interfaces/helpers/itaskhelper";
import { TaskHelper } from "./helpers/taskhelper";
import { IDebugCreator } from "./interfaces/loggers/idebugcreator";
import { DebugCreator } from "./loggers/debugcreator";
import { ConsoleLogger } from "./loggers/consolelogger";
import { IConsoleLogger } from "./interfaces/loggers/iconsolelogger";
import { IDetails } from "./interfaces/task/idetails";
import { IOrchestrator } from "./interfaces/orchestrator/iorchestrator";
import { Orchestrator } from "./orchestrator/orchestrator";
import { IReleaseProgress } from "./interfaces/common/ireleaseprogress";
import { IApiFactory } from "./interfaces/factories/iapifactory";
import { ApiFactory } from "./factories/apifactory";
import { IOrchestratorFactory } from "./interfaces/factories/iorchestratorfactory";
import { OrchestratorFactory } from "./factories/orchestratorfactory";
import { ICommonHelper } from "./interfaces/helpers/icommonhelper";
import { CommonHelper } from "./helpers/commonhelper";

async function run() {

    // Force enable debug mode when Azure DevOps pipelines
    // System diagnostics is enabled via System.Debug variable
    const forceDebug: boolean = process.env.SYSTEM_DEBUG == "true" && process.env.DEBUG == undefined;

    const debugCreator: IDebugCreator = new DebugCreator("release-orchestrator", forceDebug);
    const consoleLogger: IConsoleLogger = new ConsoleLogger();

    const commonHelper: ICommonHelper = new CommonHelper(debugCreator);
    const taskHelper: ITaskHelper = new TaskHelper(debugCreator, commonHelper);

    try {

        const endpoint: IEndpoint = await taskHelper.getEndpoint();
        const parameters: IParameters = await taskHelper.getParameters();
        const details: IDetails = await taskHelper.getDetails();

        const apiFactory: IApiFactory = new ApiFactory(endpoint, debugCreator);
        const orchestratorFactory: IOrchestratorFactory = new OrchestratorFactory(apiFactory, debugCreator, consoleLogger);
        const orchestrator: IOrchestrator = new Orchestrator(orchestratorFactory, debugCreator, consoleLogger);

        const releaseProgress: IReleaseProgress = await orchestrator.orchestrate(parameters, details);

        await taskHelper.validate(releaseProgress.status);

    } catch (error: any) {

        await taskHelper.fail(error.message);

    }

}

run();
