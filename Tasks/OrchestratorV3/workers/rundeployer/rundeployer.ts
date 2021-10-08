import { IDetails } from "../../helpers/taskhelper/idetails";
import { IRunDeployer } from "./irundeployer";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";

export class RunDeployer implements IRunDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

    }

    public async deployManual(job: IRun, details: IDetails): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        return {} as IRunProgress;

    }

    public async deployAutomated(job: IRun, details: IDetails): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        return {} as IRunProgress;

    }

}
