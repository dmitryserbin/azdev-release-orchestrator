import Debug from "debug";

import { IOrchestrator } from "../interfaces/orchestrator/orchestrator";
import { IDeployer } from "../interfaces/workers/deployer";
import { IParameters, ReleaseType } from "../interfaces/task/parameters";
import { IDetails } from "../interfaces/task/details";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IEndpoint } from "../interfaces/task/endpoint";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { ApiFactory } from "../factories/apifactory";
import { IWorkerFactory } from "../interfaces/factories/workerfactory";
import { WorkerFactory } from "../factories/workerfactory";
import { IReleaseJob } from "../interfaces/orchestrator/releasejob";
import { ICreator } from "../interfaces/workers/creator";

export class Orchestrator implements IOrchestrator {

    private debugLogger: Debug.Debugger;
    private consoleLogger: IConsoleLogger;

    private workerFactory: IWorkerFactory;

    constructor(endpoint: IEndpoint, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.consoleLogger = consoleLogger;

        const apiFactory: IApiFactory = new ApiFactory(endpoint.account, endpoint.token, debugLogger);

        this.workerFactory = new WorkerFactory(apiFactory, debugLogger, consoleLogger);

    }

    public async run(parameters: IParameters, details: IDetails) {

        const debug = this.debugLogger.extend(this.run.name);

        const creator: ICreator = await this.workerFactory.createCreator();
        const deployer: IDeployer = await this.workerFactory.createDeployer();

        // Create release job
        const releaseJob: IReleaseJob = await creator.createJob(parameters, details);

        // ORCHESTRATE RELEASE DEPLOYMENT

        switch (parameters.releaseType) {

            case ReleaseType.Create: {

                this.consoleLogger.log(`Deploying <${releaseJob.release.name}> (${releaseJob.release.id}) pipeline <${releaseJob.stages}> stage(s) release`);

                const isAutomated: boolean = await deployer.isAutomated(releaseJob);

                if (isAutomated) {

                    // Monitor automatically started stages deployment progess
                    await deployer.deployAutomated(releaseJob, details);

                } else {

                    // Manually trigger stages deployment and monitor progress
                    await deployer.deployManual(releaseJob, details);

                }

                break;

            } default: {

                console.log(`Re-deploying <${releaseJob.release.name}> (${releaseJob.release.id}) pipeline <${releaseJob.stages}> stage(s) release`);

                // Manually trigger stages deployment and monitor progress
                await deployer.deployManual(releaseJob, details);

                break;

            }

        }

    }

}
