import { IDetails } from "../../helpers/taskhelper/idetails";
import { IDeployer } from "./ideployer";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IJob } from "../creator/ijob";
import { IReleaseProgress } from "../orchestrator/ireleaseprogress";

export class Deployer implements IDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

    }

    public async deployManual(job: IJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        return {} as IReleaseProgress;

    }

    public async deployAutomated(job: IJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        return {} as IReleaseProgress;

    }

}
