import { IStageApprover } from "./istageapprover";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IStageProgress } from "../../orchestrator/istageprogress";
import { IBuildStage } from "../progressmonitor/ibuildstage";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

export class StageApprover implements IStageApprover {

    private logger: ILogger;
    private debugLogger: IDebug;

    private runApi: IRunApiRetry;

    constructor(runApi: IRunApiRetry, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.runApi = runApi;

    }

    public async approveStage(stageProgress: IStageProgress): Promise<void> {

        const debug = this.debugLogger.extend(this.approveStage.name);

        debug(`Stage <${stageProgress.name}> approval required`);

    }

}
