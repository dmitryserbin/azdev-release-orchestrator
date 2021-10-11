import { IRunDeployer } from "./irundeployer";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { IProgressMonitor } from "../progressmonitor/iprogressmonitor";
import { RunStatus } from "../../orchestrator/runstatus";

export class RunDeployer implements IRunDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    private progressMonitor: IProgressMonitor;

    constructor(progressMonitor: IProgressMonitor, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.progressMonitor = progressMonitor;

    }

    public async deployManual(run: IRun): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        const runProgress: IRunProgress = this.progressMonitor.createProgress(run);

        debug(`Starting <${runProgress.name}> (${runProgress.id}) run <${RunStatus[runProgress.status]}> progress tracking`);

        return runProgress;

    }

    public async deployAutomated(run: IRun): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        const runProgress: IRunProgress = this.progressMonitor.createProgress(run);

        debug(`Starting <${runProgress.name}> (${runProgress.id}) run <${RunStatus[runProgress.status]}> progress tracking`);

        return runProgress;

    }

}
