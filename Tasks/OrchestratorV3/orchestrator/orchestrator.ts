import { IOrchestrator } from "./iorchestrator";
import { IRunDeployer } from "../workers/rundeployer/irundeployer";
import { IParameters } from "../helpers/taskhelper/iparameters";
import { ReleaseType } from "../helpers/taskhelper/releasetype";
import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";
import { IWorkerFactory } from "../factories/workerfactory/iworkerfactory";
import { IRun } from "../workers/runcreator/irun";
import { IRunCreator } from "../workers/runcreator/iruncreator";
import { IRunProgress } from "./irunprogress";
import { IProgressReporter } from "../workers/progressreporter/iprogressreporter";

export class Orchestrator implements IOrchestrator {

    private logger: ILogger;
    private debugLogger: IDebug;

    private workerFactory: IWorkerFactory;

    constructor(workerFactory: IWorkerFactory, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.workerFactory = workerFactory; 

    }

    public async orchestrate(parameters: IParameters): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.orchestrate.name);

        let runProgress: IRunProgress;

        const runCreator: IRunCreator = await this.workerFactory.createRunCreator();
        const runDeployer: IRunDeployer = await this.workerFactory.createRunDeployer();
        const progressReporter: IProgressReporter = await this.workerFactory.createProgressReporter();

        const run: IRun = await runCreator.create(parameters);

        debug(`Starting <${ReleaseType[parameters.releaseType]}> pipeline orchestration type`);

        switch (parameters.releaseType) {

            case ReleaseType.New: {

                this.logger.log(`Deploying new <${run.definition.name}> pipeline <${run.build.buildNumber}> (${run.build.id}) run`);

                progressReporter.logRun(run);

                runProgress = await runDeployer.deployAutomated(run);

                break;

            } case ReleaseType.Latest: {

                this.logger.log(`Re-deploying latest <${run.definition.name}> pipeline <${run.build.buildNumber}> (${run.build.id}) run`);

                progressReporter.logRun(run);

                runProgress = await runDeployer.deployManual(run);

                break;

            } case ReleaseType.Specific: {

                this.logger.log(`Re-deploying specific <${run.definition.name}> pipeline <${run.build.buildNumber}> (${run.build.id}) run`);

                progressReporter.logRun(run);

                runProgress = await runDeployer.deployManual(run);

                break;

            }

        }

        progressReporter.logRunProgress(runProgress);

        return runProgress;

    }

}
