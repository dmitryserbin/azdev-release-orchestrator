import * as path from "path";

import * as mr from "azure-pipelines-task-lib/mock-run";

import { MockEndpoint } from "./helpers";

const tmr: mr.TaskMockRunner = new mr.TaskMockRunner(path.join(__dirname, "mock.getEndpoint.js"));

MockEndpoint(tmr, process.env.EndpointType, process.env.EndpointName, process.env.EndpointAccount, process.env.EndpointToken);

tmr.run();
