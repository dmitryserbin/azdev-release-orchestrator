import { IOrchestrator } from "./iorchestrator";
import { IDeployer } from "../deployer/ideployer";
import { IParameters } from "../../helpers/taskhelper/iparameters";
import { ReleaseType } from "../../helpers/taskhelper/releasetype";
import { IDetails } from "../../helpers/taskhelper/idetails";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IWorkerFactory } from "../../factories/workerfactory/iworkerfactory";
import { IRun } from "../runcreator/irun";
import { IRunCreator } from "../runcreator/iruncreator";
import { IRunProgress } from "./irunprogress";
import { RunType } from "./runtype";
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

    public async orchestrate(parameters: IParameters, details: IDetails): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.orchestrate.name);

        let runProgress: IRunProgress;

        const runCreator: IRunCreator = await this.workerFactory.createRunCreator();
        const deployer: IDeployer = await this.workerFactory.createDeployer();
        const reporter: IReporter = await this.workerFactory.createReporter();

        const run: IRun = await runCreator.create(parameters, details);

        switch (parameters.releaseType) {

            case ReleaseType.New: {

                switch (run.type) {

                    case RunType.Automated: {

                        runProgress = await deployer.deployAutomated(run, details);

                        break;

                    } case RunType.Manual: {

                        runProgress = await deployer.deployManual(run, details);

                        break;

                    }

                }

                break;

            } case ReleaseType.Latest: {

                runProgress = await deployer.deployManual(run, details);

                break;

            } case ReleaseType.Specific: {

                runProgress = await deployer.deployManual(run, details);

                break;

            }

        }

        return runProgress;

    }

}
