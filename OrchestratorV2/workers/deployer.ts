import Debug from "debug";

import { IDetails } from "../interfaces/task/details";
import { IDeployer } from "../interfaces/workers/deployer";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseJob } from "../interfaces/orchestrator/releasejob";

export class Deployer implements IDeployer {

    private debugLogger: Debug.Debugger;
    private consoleLogger: IConsoleLogger;

    private coreHelper: ICoreHelper;
    private releaseHelper: IReleaseHelper;

    constructor(coreHelper: ICoreHelper, releaseHelper: IReleaseHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.coreHelper = coreHelper;
        this.releaseHelper = releaseHelper;

    }

    public async deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<void> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        // TBU

    }

    public async deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<void> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        // TBU

    }

}
