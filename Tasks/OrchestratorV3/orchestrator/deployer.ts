import { IDetails } from "../interfaces/task/details";
import { IDeployer } from "../interfaces/orchestrator/deployer";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { IReleaseJob } from "../interfaces/common/releasejob";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";

export class Deployer implements IDeployer {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    constructor(debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

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
