/* eslint-disable @typescript-eslint/no-explicit-any */

import { IEndpoint } from "./helpers/taskhelper/iendpoint";
import { IParameters } from "./helpers/taskhelper/iparameters";
import { ITaskHelper } from "./helpers/taskhelper/itaskhelper";
import { TaskHelper } from "./helpers/taskhelper/taskhelper";
import { Logger } from "./loggers/logger";
import { ILogger } from "./loggers/ilogger";
import { IOrchestrator } from "./orchestrator/iorchestrator";
import { Orchestrator } from "./orchestrator/orchestrator";
import { IRunProgress } from "./orchestrator/irunprogress";
import { IApiFactory } from "./factories/apifactory/iapifactory";
import { ApiFactory } from "./factories/apifactory/apifactory";
import { IWorkerFactory } from "./factories/workerfactory/iworkerfactory";
import { WorkerFactory } from "./factories/workerfactory/workerfactory";
import { IProgressReporter } from "./workers/progressreporter/iprogressreporter";
import { IRunCreator } from "./workers/runcreator/iruncreator";
import { IRunDeployer } from "./workers/rundeployer/irundeployer";

async function run() {

    // Force enable debug mode when Azure DevOps pipelines
    // System diagnostics is enabled via System.Debug variable
    const systemDebug: boolean = process.env.SYSTEM_DEBUG == "true" && process.env.DEBUG == undefined;

    const logger: ILogger = new Logger("release-orchestrator", systemDebug);

    const taskHelper: ITaskHelper = new TaskHelper(logger);

    try {

        const endpoint: IEndpoint = await taskHelper.getEndpoint();
        const parameters: IParameters = await taskHelper.getParameters();

        const apiFactory: IApiFactory = new ApiFactory(endpoint, logger);
        const workerFactory: IWorkerFactory = new WorkerFactory(apiFactory, logger);

        const runCreator: IRunCreator = await workerFactory.createRunCreator();
        const runDeployer: IRunDeployer = await workerFactory.createRunDeployer();
        const progressReporter: IProgressReporter = await workerFactory.createProgressReporter();

        const orchestrator: IOrchestrator = new Orchestrator(runCreator, runDeployer, progressReporter, logger);

        // Run orchestrator
        const releaseProgress: IRunProgress = await orchestrator.orchestrate(parameters);

        await taskHelper.validate(releaseProgress.status);

    } catch (error: any) {

        await taskHelper.fail(error.message);

    }

}

run();
