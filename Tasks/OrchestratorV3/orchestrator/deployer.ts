import { IDetails } from "../interfaces/task/idetails";
import { IDeployer } from "../interfaces/orchestrator/ideployer";
import { IDebug } from "../interfaces/loggers/idebug";
import { ILogger } from "../interfaces/loggers/ilogger";
import { IReleaseJob } from "../interfaces/common/ireleasejob";
import { IReleaseProgress } from "../interfaces/common/ireleaseprogress";

export class Deployer implements IDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

    }

    public async deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        return {} as IReleaseProgress;

    }

    public async deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        return {} as IReleaseProgress;

    }

}
