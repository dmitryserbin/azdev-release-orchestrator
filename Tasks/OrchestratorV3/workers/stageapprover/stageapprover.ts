/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IStageApprover } from "./istageapprover";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IBuildWebApiRetry } from "../../extensions/buildwebapiretry/ibuildwebapiretry";
import { IBuildStage } from "../progressmonitor/ibuildstage";
import { IBuildApproval } from "../progressmonitor/ibuildapproval";
import { IBuildCheck } from "../progressmonitor/ibuildcheck";
import { IPipelinesApiRetry } from "../../extensions/pipelinesapiretry/ipipelineapiretry";

export class StageApprover implements IStageApprover {

    private logger: ILogger;
    private debugLogger: IDebug;

    private pipelinesApi: IPipelinesApiRetry;
    private buildWebApi: IBuildWebApiRetry;

    constructor(pipelinesApi: IPipelinesApiRetry, buildWebApi: IBuildWebApiRetry, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.pipelinesApi = pipelinesApi;
        this.buildWebApi = buildWebApi;

    }

    public async approve(build: Build, stage: IBuildStage, comment?: string): Promise<IBuildStage> {

        const debug = this.debugLogger.extend(this.approve.name);

        // Increment retry count
        stage.attempt.approval++;

        this.logger.log(`Approving <${stage.name}> (${stage.id}) stage progress (attempt ${stage.attempt.approval})`);

        // Approve all pending requests in sequence
        // To support multiple approvals scenarios
        for (const approval of stage.approvals) {

            try {

                debug(`Requesting <${approval.id}> approval <${TimelineRecordState[approval.state]}> update`);

                const request: unknown = {

                    approvalId: approval.id,
                    status: `approved`,
                    comment: comment ? comment : ``,

                };

                const approvalResult: any = await this.pipelinesApi.updateApproval(build, request);

                debug(approvalResult);

                // No need to approve following request
                // When at least one approval succeeded
                if (approvalResult.status === `approved`) {

                    this.logger.log(`Stage <${stage.name}> (${stage.id}) approved successfully`);

                    approval.state = TimelineRecordState.Completed;

                    break;

                }

            } catch (error: any) {

                debug(`Approval <${approval.id}> request rejected`);

                debug(error);

                approval.state = TimelineRecordState.Pending;

            }

        }

        return stage;

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
