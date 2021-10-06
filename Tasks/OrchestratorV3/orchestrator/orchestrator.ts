import { IOrchestrator } from "../interfaces/orchestrator/orchestrator";
import { IDeployer } from "../interfaces/orchestrator/deployer";
import { IParameters } from "../interfaces/task/parameters";
import { ReleaseType } from "../interfaces/common/releasetype";
import { IDetails } from "../interfaces/task/details";
import { IDebug } from "../interfaces/loggers/debug";
import { ILogger } from "../interfaces/loggers/logger";
import { IOrchestratorFactory } from "../interfaces/factories/orchestratorfactory";
import { IReleaseJob } from "../interfaces/common/releasejob";
import { ICreator } from "../interfaces/orchestrator/creator";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";
import { DeploymentType } from "../interfaces/common/deploymenttype";
import { IReporter } from "../interfaces/orchestrator/reporter";

export class Orchestrator implements IOrchestrator {

    private logger: ILogger;
    private debugLogger: IDebug;

    private orchestratorFactory: IOrchestratorFactory;

    constructor(orchestratorFactory: IOrchestratorFactory, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.orchestratorFactory = orchestratorFactory; 

    }

    public async orchestrate(parameters: IParameters, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.orchestrate.name);

        let releaseProgress: IReleaseProgress;

        const creator: ICreator = await this.orchestratorFactory.createCreator();
        const deployer: IDeployer = await this.orchestratorFactory.createDeployer();
        const reporter: IReporter = await this.orchestratorFactory.createReporter();

        // Create release job
        const releaseJob: IReleaseJob = await creator.createJob(parameters, details);

        switch (parameters.releaseType) {

            case ReleaseType.New: {

                switch (releaseJob.type) {

                    case DeploymentType.Automated: {

                        releaseProgress = await deployer.deployAutomated(releaseJob, details);

                        break;

                    } case DeploymentType.Manual: {

                        releaseProgress = await deployer.deployManual(releaseJob, details);

                        break;

                    }

                }

                break;

            } case ReleaseType.Latest: {

                releaseProgress = await deployer.deployManual(releaseJob, details);

                break;

            } case ReleaseType.Specific: {

                releaseProgress = await deployer.deployManual(releaseJob, details);

                break;

            }

        }

        return releaseProgress;

    }

}
