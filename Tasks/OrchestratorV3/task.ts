/* eslint-disable @typescript-eslint/no-explicit-any */

import { IEndpoint } from "./interfaces/task/endpoint";
import { IParameters } from "./interfaces/task/parameters";
import { ITaskHelper } from "./interfaces/helpers/taskhelper";
import { TaskHelper } from "./helpers/taskhelper";
import { Logger } from "./loggers/logger";
import { ILogger } from "./interfaces/loggers/logger";
import { IDetails } from "./interfaces/task/details";
import { IOrchestrator } from "./interfaces/orchestrator/orchestrator";
import { Orchestrator } from "./orchestrator/orchestrator";
import { IReleaseProgress } from "./interfaces/common/releaseprogress";
import { IApiFactory } from "./interfaces/factories/apifactory";
import { ApiFactory } from "./factories/apifactory";
import { IOrchestratorFactory } from "./interfaces/factories/orchestratorfactory";
import { OrchestratorFactory } from "./factories/orchestratorfactory";

async function run() {

    const logger: ILogger = new Logger("release-orchestrator");

    const taskHelper: ITaskHelper = new TaskHelper(logger);

    try {

        const endpoint: IEndpoint = await taskHelper.getEndpoint();
        const parameters: IParameters = await taskHelper.getParameters();
        const details: IDetails = await taskHelper.getDetails();

        const apiFactory: IApiFactory = new ApiFactory(endpoint, logger);
        const orchestratorFactory: IOrchestratorFactory = new OrchestratorFactory(apiFactory, logger);

        const orchestrator: IOrchestrator = new Orchestrator(orchestratorFactory, logger);

        // Run orchestrator
        const releaseProgress: IReleaseProgress = await orchestrator.orchestrate(parameters, details);

        await taskHelper.validate(releaseProgress.status);

    } catch (error: any) {

        await taskHelper.fail(error.message);

    }

}

run();
