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

        const deployer: IDeployer = await this.workerFactory.createDeployer();

        console.log(`Starting <${parameters.projectId}> project ${ReleaseType[parameters.releaseType].toLowerCase()} <${parameters.definitionId}> release deployment`);

        // GET PROJECT & DEFINITION DETAILS

        // CREATE TARGET RELEASE JOB

        const targetRelease: IReleaseJob = {

            stages: [],
            sleep: 5000,

        };

        // ORCHESTRATE RELEASE DEPLOYMENT

        if (parameters.releaseType === ReleaseType.Create) {

            console.log(`Deploying <${targetRelease.release?.name}> (${targetRelease.release?.id}) pipeline <${targetRelease.stages}> stage(s) release`);

            // TBU

        } else {

            console.log(`Re-deploying <${targetRelease.release?.name}> (${targetRelease.release?.id}) pipeline <${targetRelease.stages}> stage(s) release`);

            // TBU

        }

    }

}
