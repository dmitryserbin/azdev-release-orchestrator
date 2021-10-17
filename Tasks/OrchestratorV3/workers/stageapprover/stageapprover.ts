import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IStageApprover } from "./istageapprover";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IStageProgress } from "../../orchestrator/istageprogress";
import { IRunApiRetry } from "../../extensions/runapiretry/irunapiretry";
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

        stageProgress.approval = "Pending"

        return stageProgress;

    }

    public async getChecks(build: Build, stage: IBuildStage): Promise<unknown> {

        const debug = this.debugLogger.extend(this.getChecks.name);

        const checks: unknown = await this.runApi.getRunStageChecks(build, stage);

        debug(checks);

        return checks;

    }

    public isApprovalPeding(stageChecks: any): boolean {

        const debug = this.debugLogger.extend(this.isApprovalPeding.name);

        let isPending: boolean = false;

        const approvals: any[] = stageChecks.approvals;

        if (Array.isArray(approvals) && approvals.length) {

            isPending = true;

        }

        if (isPending) {

            debug(`Stage <${stageChecks.stageName}> (${stageChecks.stageId}) is pending <${approvals.length}> approval`);

        }

        return isPending;

    }

    public isCheckPeding(stageChecks: any): boolean {

        const debug = this.debugLogger.extend(this.isCheckPeding.name);

        let isPending: boolean = false;

        const taskChecks: any[] = stageChecks.taskChecks;

        if (Array.isArray(taskChecks) && taskChecks.length) {

            const pendingTaskChecks: any[] = taskChecks.filter(
                (check) => check.status !== 4);

            if (pendingTaskChecks.length) {

                debug(`Stage <${stageChecks.stageName}> (${stageChecks.stageId}) is pending <${pendingTaskChecks.length}> task checks`);

                isPending = true;

            }

        }

        return isPending;

    }

}
