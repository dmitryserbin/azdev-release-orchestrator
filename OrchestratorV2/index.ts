import * as tl from "azure-pipelines-task-lib/task";

async function run() {

    try {

        // TBU

    } catch (err) {

        const taskResult: tl.TaskResult = tl.getBoolInput("IgnoreFailure") ? tl.TaskResult.SucceededWithIssues : tl.TaskResult.Failed;

        tl.setResult(taskResult, err.message);

    }

}

run();
