/* eslint-disable @typescript-eslint/no-explicit-any */

import { IEndpoint } from "./helpers/taskhelper/iendpoint";
import { IParameters } from "./helpers/taskhelper/iparameters";
import { ITaskHelper } from "./helpers/taskhelper/itaskhelper";
import { TaskHelper } from "./helpers/taskhelper/taskhelper";
import { Logger } from "./loggers/logger";
import { ILogger } from "./loggers/ilogger";
import { IOrchestrator } from "./workers/orchestrator/iorchestrator";
import { Orchestrator } from "./workers/orchestrator/orchestrator";
import { IRunProgress } from "./workers/orchestrator/irunprogress";
import { IApiFactory } from "./factories/apifactory/iapifactory";
import { ApiFactory } from "./factories/apifactory/apifactory";
import { IWorkerFactory } from "./factories/workerfactory/iworkerfactory";
import { WorkerFactory } from "./factories/workerfactory/workerfactory";

async function run() {

    const logger: ILogger = new Logger("release-orchestrator");

    const taskHelper: ITaskHelper = new TaskHelper(logger);

    try {

        const endpoint: IEndpoint = await taskHelper.getEndpoint();
        const parameters: IParameters = await taskHelper.getParameters();

        const apiFactory: IApiFactory = new ApiFactory(endpoint, logger);
        const workerFactory: IWorkerFactory = new WorkerFactory(apiFactory, logger);
        const orchestrator: IOrchestrator = new Orchestrator(workerFactory, logger);

        // Run orchestrator
        const releaseProgress: IRunProgress = await orchestrator.orchestrate(parameters);

        await taskHelper.validate(releaseProgress.status);

    } catch (error: any) {

        await taskHelper.fail(error.message);

    }

}

run();
