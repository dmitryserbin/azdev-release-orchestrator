import Debug from "debug";

import { IParameters } from "../interfaces/task/parameters";
import { IDetails } from "../interfaces/task/details";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { ICreator } from "../interfaces/workers/creator";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IReleaseJob } from "../interfaces/orchestrator/releasejob";

export class Creator implements ICreator {

    private debugLogger: Debug.Debugger;
    private consoleLogger: IConsoleLogger;

    private coreHelper: ICoreHelper;
    private buildHelper: IBuildHelper;
    private releaseHelper: IReleaseHelper;

    constructor(coreHelper: ICoreHelper, buildHelper: IBuildHelper, releaseHelper: IReleaseHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.coreHelper = coreHelper;
        this.buildHelper = buildHelper;
        this.releaseHelper = releaseHelper;

    }

    public async createJob(parameters: IParameters, details: IDetails): Promise<IReleaseJob> {

        // TBU

    }

}
