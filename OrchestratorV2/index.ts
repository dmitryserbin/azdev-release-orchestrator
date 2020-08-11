import * as tl from "azure-pipelines-task-lib/task";

import { IEndpoint } from "./interfaces/common/endpoint";
import { IParameters } from "./interfaces/common/parameters";
import { ITaskHelper } from "./interfaces/helpers/taskhelper";
import { TaskHelper } from "./helpers/taskhelper";
import { IDebugLogger } from "./interfaces/common/debuglogger";
import { DebugLogger } from "./common/debuglogger";
import { ConsoleLogger } from "./common/consolelogger";
import { IConsoleLogger } from "./interfaces/common/consolelogger";

async function run() {

    const debugLogger: IDebugLogger = new DebugLogger("release-orchestrator");
    const consoleLogger: IConsoleLogger = new ConsoleLogger();

    const taskHelper: ITaskHelper = new TaskHelper(debugLogger);

    try {

        const endpoint: IEndpoint = await taskHelper.getEndpoint();
        const parameters: IParameters = await taskHelper.getParameters();

    } catch (err) {

        const taskResult: tl.TaskResult = tl.getBoolInput("IgnoreFailure")
            ? tl.TaskResult.SucceededWithIssues : tl.TaskResult.Failed;

        tl.setResult(taskResult, err.message);

    }

}

run();
