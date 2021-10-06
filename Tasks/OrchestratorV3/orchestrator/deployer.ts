import { IDetails } from "../interfaces/task/details";
import { IDeployer } from "../interfaces/orchestrator/deployer";
import { IDebug } from "../interfaces/loggers/debug";
import { ILogger } from "../interfaces/loggers/logger";
import { IReleaseJob } from "../interfaces/common/releasejob";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";

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
