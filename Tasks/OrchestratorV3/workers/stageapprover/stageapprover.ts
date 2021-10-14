import { IStageApprover } from "./istageapprover";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IStageProgress } from "../../orchestrator/istageprogress";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { IBuildStage } from "../progressmonitor/ibuildstage";

export class StageApprover implements IStageApprover {

    private logger: ILogger;
    private debugLogger: IDebug;

    private runApi: IRunApiRetry;

    constructor(runApi: IRunApiRetry, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.runApi = runApi;

    }

    public async approve(stageProgress: IStageProgress): Promise<IStageProgress> {

        const debug = this.debugLogger.extend(this.approve.name);

        debug(`Approving <${stageProgress.name}> (${stageProgress.id}) stage progress`);

        return stageProgress;

    }

    public async isPeding(build: Build, stage: IBuildStage): Promise<boolean> {

        const debug = this.debugLogger.extend(this.isPeding.name);

        let isPending: boolean = false;

        const stageChecks: any = await this.runApi.getRunStageChecks(build, stage);

        debug(stageChecks);

        if (stageChecks.approvals && Object.keys(stageChecks.approvals).length) {

            // TBU

            isPending = true;

        }

        if (isPending) {

            debug(`Stage <${stage.name}> (${stage.id}) is pending approval`);

        }

        return isPending;

    }

}
