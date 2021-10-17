import { TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IStageApprover } from "./istageapprover";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IStageProgress } from "../../orchestrator/istageprogress";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";
import { IBuildStage } from "../progressmonitor/ibuildstage";
import { IBuildApproval } from "../progressmonitor/ibuildapproval";
import { IBuildCheck } from "../progressmonitor/ibuildcheck";

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

        stageProgress.approval = "Pending"

        return stageProgress;

    }

    public isApprovalPeding(stage: IBuildStage): boolean {

        const debug = this.debugLogger.extend(this.isApprovalPeding.name);

        let isPending: boolean = false;

        const pendingApprovals: IBuildApproval[] = stage.approvals.filter(
            (approval) => approval.state !== TimelineRecordState.Completed);

        if (pendingApprovals.length) {

            isPending = true;

        }

        if (isPending) {

            debug(`Stage <${stage.name}> (${stage.id}) is pending <${pendingApprovals.length}> approval`);

        }

        return isPending;

    }

    public isCheckPeding(stage: IBuildStage): boolean {

        const debug = this.debugLogger.extend(this.isCheckPeding.name);

        let isPending: boolean = false;

        const pendingChecks: IBuildCheck[] = stage.checks.filter(
            (check) => check.state !== TimelineRecordState.Completed);

        if (pendingChecks.length) {

            isPending = true;

        }

        if (isPending) {

            debug(`Stage <${stage.name}> (${stage.id}) is pending <${pendingChecks.length}> task checks`);

        }

        return isPending;

    }

}
