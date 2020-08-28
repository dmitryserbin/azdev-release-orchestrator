import * as path from "path";

import * as mr from "azure-pipelines-task-lib/mock-run";
import { MockInput } from "./helpers";

const tmr: mr.TaskMockRunner = new mr.TaskMockRunner(path.join(__dirname, "mock.getDetails.js"));

MockInput(tmr, [

    "ConnectedService",
    "SYSTEM_TEAMPROJECT",
    "RELEASE_RELEASENAME",
    "RELEASE_DEPLOYMENT_REQUESTEDFOR",
    "RELEASE_DEPLOYMENT_REQUESTEDFORID",

]);

tmr.run();
