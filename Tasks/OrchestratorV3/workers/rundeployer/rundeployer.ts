import { IDetails } from "../../helpers/taskhelper/idetails";
import { IRunDeployer } from "./irundeployer";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { IProgressMonitor } from "../progressmonitor/iprogressmonitor";

export class RunDeployer implements IRunDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    private progressMonitor: IProgressMonitor;

    constructor(progressMonitor: IProgressMonitor, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.progressMonitor = progressMonitor;

    }

    public async deployManual(run: IRun, details: IDetails): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        const runProgress: IRunProgress = this.progressMonitor.createProgress(run);

        return runProgress;

    }

    public async deployAutomated(run: IRun, details: IDetails): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        const runProgress: IRunProgress = this.progressMonitor.createProgress(run);

        return runProgress;

    }

}
