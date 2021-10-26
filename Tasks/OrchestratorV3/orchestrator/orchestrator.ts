import { IOrchestrator } from "./iorchestrator";
import { IRunDeployer } from "../workers/rundeployer/irundeployer";
import { IParameters } from "../helpers/taskhelper/iparameters";
import { Strategy } from "../helpers/taskhelper/strategy";
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

        debug(`Starting <${Strategy[parameters.strategy]}> pipeline orchestration strategy`);

        switch (parameters.strategy) {

            case Strategy.New: {

                this.logger.log(`Executing new <${run.definition.name}> pipeline <${run.build.buildNumber}> (${run.build.id}) run`);

                progressReporter.logRun(run);

                runProgress = await runDeployer.deployAutomated(run);

                break;

            } case Strategy.Latest: {

                this.logger.log(`Executing latest <${run.definition.name}> pipeline <${run.build.buildNumber}> (${run.build.id}) run`);

                progressReporter.logRun(run);

                runProgress = await runDeployer.deployManual(run);

                break;

            } case Strategy.Specific: {

                this.logger.log(`Executing specific <${run.definition.name}> pipeline <${run.build.buildNumber}> (${run.build.id}) run`);

                progressReporter.logRun(run);

                runProgress = await runDeployer.deployManual(run);

                break;

            }

        }

        progressReporter.logRunProgress(runProgress);

        return runProgress;

    }

}
