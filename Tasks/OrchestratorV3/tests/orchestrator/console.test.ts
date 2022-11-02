import "mocha";

import { IRunCreator } from "../../workers/runcreator/iruncreator";
import { IRunDeployer } from "../../workers/rundeployer/irundeployer";
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter";
import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { IOrchestrator } from "../../orchestrator/iorchestrator";
import { Orchestrator } from "../../orchestrator/orchestrator";
import { IEndpoint } from "../../helpers/taskhelper/iendpoint";
import { ILogger } from "../../loggers/ilogger";
import { Logger } from "../../loggers/logger";
import { ApiFactory } from "../../factories/apifactory/apifactory";
import { IApiFactory } from "../../factories/apifactory/iapifactory";
import { IWorkerFactory } from "../../factories/workerfactory/iworkerfactory";
import { WorkerFactory } from "../../factories/workerfactory/workerfactory";
import { Strategy } from "../../helpers/taskhelper/strategy";

describe("Console", async () => {

    const logger: ILogger = new Logger("release-orchestrator", true);

    const endpontUrl: string | undefined = process.env.ORCHESTRATOR_ENDPOINT_URL;

    if (!endpontUrl) {

        throw new Error("Variable <ORCHESTRATOR_ENDPOINT_URL> not found");

    }

    const endpontToken: string | undefined = process.env.ORCHESTRATOR_ENDPOINT_TOKEN;

    if (!endpontToken) {

        throw new Error("Variable <ORCHESTRATOR_ENDPOINT_TOKEN> not found");

    }

    let endpoint: IEndpoint;
    let parameters: IParameters;

    beforeEach(() => {

        endpoint = {
            url: endpontUrl,
            token: endpontToken,
        };

        parameters = {
            strategy: Strategy.New,
            projectName: "HelloYo",
            definitionName: "HelloYo-release",
            stages: [
                "DEV",
            ],
            parameters: {
                message: "Yo!",
            },
            filters: {

                buildNumber: "",
                branchName: "",
                buildResult: "",
                buildTags: [],
                pipelineResources: {},
                repositoryResources: {},

            },
            settings: {
                updateInterval: 1000,
                stageStartAttempts: 1,
                stageStartInterval: 1000,
                approvalInterval: 1000,
                approvalAttempts: 1,
                cancelFailedCheckpoint: false,
                proceedSkippedStages: false,
                skipTracking: false,
            },
            details: {
                endpointName: "Project Collection Build Service",
                projectName: "Unknown",
                releaseName: "Unknown",
                requesterName: "Release Orchestrator",
                requesterId: "Unknown",
            },
        };

    });

    it("Should orchestrate new run @manual", async () => {

        const apiFactory: IApiFactory = new ApiFactory(endpoint, logger);
        const workerFactory: IWorkerFactory = new WorkerFactory(apiFactory, logger);

        const runCreator: IRunCreator = await workerFactory.createRunCreator();
        const runDeployer: IRunDeployer = await workerFactory.createRunDeployer();
        const progressReporter: IProgressReporter = await workerFactory.createProgressReporter();

        const orchestrator: IOrchestrator = new Orchestrator(runCreator, runDeployer, progressReporter, logger);

        const releaseProgress: IRunProgress = await orchestrator.orchestrate(parameters);

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
