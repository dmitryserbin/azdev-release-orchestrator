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

        this.consoleLogger.log(`Release orchestrated manually as stages deployment conditions are NOT met`);

    }

    public async deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<void> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        this.consoleLogger.log(`Release automatically started as stages deployment conditions are met`);

    }

    public async isAutomated(releaseJob: IReleaseJob): Promise<boolean> {

        const debug = this.debugLogger.extend(this.isAutomated.name);

        const status: boolean = await this.releaseHelper.getConditionsStatus(releaseJob.release);

        debug(status);

        return status;

    }

}
