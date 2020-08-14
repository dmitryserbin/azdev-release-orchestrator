import { IOrchestrator } from "../interfaces/orchestrator/orchestrator";
import { IDeployer } from "../interfaces/orchestrator/deployer";
import { IParameters, ReleaseType } from "../interfaces/task/parameters";
import { IDetails } from "../interfaces/task/details";
import { IDebugLogger, IDebugger } from "../interfaces/loggers/debuglogger";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { IEndpoint } from "../interfaces/task/endpoint";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { ApiFactory } from "../factories/apifactory";
import { IOrchestratorFactory } from "../interfaces/factories/orchestratorfactory";
import { OrchestratorFactory } from "../factories/orchestratorfactory";
import { IReleaseJob } from "../interfaces/common/releasejob";
import { ICreator } from "../interfaces/orchestrator/creator";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";
import { DeploymentType } from "../interfaces/common/deploymenttype";

export class Orchestrator implements IOrchestrator {

    private debugLogger: IDebugger;
    private consoleLogger: IConsoleLogger;

    private orchestratorFactory: IOrchestratorFactory;

    constructor(endpoint: IEndpoint, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.consoleLogger = consoleLogger;

        const apiFactory: IApiFactory = new ApiFactory(endpoint.account, endpoint.token, debugLogger);

        this.orchestratorFactory = new OrchestratorFactory(apiFactory, debugLogger, consoleLogger);

    }

    public async orchestrate(parameters: IParameters, details: IDetails) {

        const debug = this.debugLogger.extend(this.orchestrate.name);

        let releaseProgress: IReleaseProgress;

        const creator: ICreator = await this.orchestratorFactory.createCreator();
        const deployer: IDeployer = await this.orchestratorFactory.createDeployer();

        // Create release job
        const releaseJob: IReleaseJob = await creator.createJob(parameters, details);

        switch (parameters.releaseType) {

            case ReleaseType.Create: {

                this.consoleLogger.log(`Deploying <${releaseJob.release.name}> (${releaseJob.release.id}) pipeline <${releaseJob.stages}> stage(s) release`);

                switch (releaseJob.type) {

                    case DeploymentType.Automated: {

                        // Monitor automatically started stages deployment progess
                        releaseProgress = await deployer.deployAutomated(releaseJob, details);

                        break;

                    } case DeploymentType.Manual: {

                        // Manually trigger stages deployment and monitor progress
                        releaseProgress = await deployer.deployManual(releaseJob, details);

                        break;

                    }

                }

                break;

            } default: {

                console.log(`Re-deploying <${releaseJob.release.name}> (${releaseJob.release.id}) pipeline <${releaseJob.stages}> stage(s) release`);

                // Manually trigger stages deployment and monitor progress
                releaseProgress = await deployer.deployManual(releaseJob, details);

                break;

            }

        }

        debug(releaseProgress);

    }

}
