import { IOrchestrator } from "./iorchestrator";
import { IDeployer } from "../deployer/ideployer";
import { IParameters } from "../../helpers/taskhelper/iparameters";
import { ReleaseType } from "../../helpers/taskhelper/releasetype";
import { IDetails } from "../../helpers/taskhelper/idetails";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IWorkerFactory } from "../../factories/workerfactory/iworkerfactory";
import { IJob } from "../creator/ijob";
import { ICreator } from "../creator/icreator";
import { IReleaseProgress } from "./ireleaseprogress";
import { JobType } from "../creator/jobtype";
import { IReporter } from "../reporter/ireporter";

export class Orchestrator implements IOrchestrator {

    private logger: ILogger;
    private debugLogger: IDebug;

    private workerFactory: IWorkerFactory;

    constructor(workerFactory: IWorkerFactory, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.workerFactory = workerFactory; 

    }

    public async orchestrate(parameters: IParameters, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.orchestrate.name);

        let releaseProgress: IReleaseProgress;

        const creator: ICreator = await this.workerFactory.createCreator();
        const deployer: IDeployer = await this.workerFactory.createDeployer();
        const reporter: IReporter = await this.workerFactory.createReporter();

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
