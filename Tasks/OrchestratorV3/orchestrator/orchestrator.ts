import { IOrchestrator } from "../interfaces/orchestrator/iorchestrator";
import { IDeployer } from "../interfaces/orchestrator/ideployer";
import { IParameters } from "../interfaces/task/iparameters";
import { ReleaseType } from "../interfaces/common/ireleasetype";
import { IDetails } from "../interfaces/task/idetails";
import { IDebug } from "../interfaces/loggers/idebug";
import { ILogger } from "../interfaces/loggers/ilogger";
import { IOrchestratorFactory } from "../interfaces/factories/iorchestratorfactory";
import { IJob } from "../interfaces/common/ijob";
import { ICreator } from "../interfaces/orchestrator/icreator";
import { IReleaseProgress } from "../interfaces/common/ireleaseprogress";
import { JobType } from "../interfaces/common/ijobtype";
import { IReporter } from "../interfaces/orchestrator/ireporter";

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

        const job: IJob = await creator.createJob(parameters, details);

        switch (parameters.releaseType) {

            case ReleaseType.New: {

                switch (job.type) {

                    case JobType.Automated: {

                        releaseProgress = await deployer.deployAutomated(job, details);

                        break;

                    } case JobType.Manual: {

                        releaseProgress = await deployer.deployManual(job, details);

                        break;

                    }

                }

                break;

            } case ReleaseType.Latest: {

                releaseProgress = await deployer.deployManual(job, details);

                break;

            } case ReleaseType.Specific: {

                releaseProgress = await deployer.deployManual(job, details);

                break;

            }

        }

        return releaseProgress;

    }

}
