/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, BuildStatus, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IStageApprover } from "./istageapprover";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IBuildStage } from "../progressmonitor/ibuildstage";
import { IBuildApproval } from "../progressmonitor/ibuildapproval";
import { IBuildCheck } from "../progressmonitor/ibuildcheck";
import { ISettings } from "../../helpers/taskhelper/isettings";
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper";
import { IStageSelector } from "../../helpers/stageselector/istageselector";
import { IBuildSelector } from "../../helpers/buildselector/ibuildselector";

export class StageApprover implements IStageApprover {

    private logger: ILogger;
    private debugLogger: IDebug;

    private buildSelector: IBuildSelector;
    private stageSelector: IStageSelector;
    private commonHelper: ICommonHelper;

    constructor(buildSelector: IBuildSelector, stageSelector: IStageSelector, commonHelper: ICommonHelper, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.buildSelector = buildSelector;
        this.stageSelector = stageSelector;
        this.commonHelper = commonHelper;

    }

    public async approve(stage: IBuildStage, build: Build, settings: ISettings, comment?: string): Promise<IBuildStage> {

        const debug = this.debugLogger.extend(this.approve.name);

        stage.attempt.approval++;

        this.logger.log(`Approving <${stage.name}> (${stage.id}) stage progress (attempt ${stage.attempt.approval})`);

        const pendingApprovals: IBuildApproval[] = stage.approvals.filter(
            (approval) => approval.state !== TimelineRecordState.Completed);

        // Approve all pending requests in sequence
        // To support multiple required approvals scenario
        for (const approval of pendingApprovals) {

            try {

                debug(`Requesting <${approval.id}> approval <${TimelineRecordState[approval.state]}> update`);

                const approvalResult: any = await this.stageSelector.approveStage(build, approval, comment);

                // No need to approve following request
                // When at least one approval succeeded
                if (approvalResult.status === `approved`) {

                    this.logger.log(`Stage <${stage.name}> (${stage.id}) approved successfully`);

                    approval.state = TimelineRecordState.Completed;

                    continue;

                }

            } catch (error: any) {

                debug(`Stage <${stage.name}> (${stage.id}) approval <${approval.id}> rejected`);

                debug(error);

                approval.state = TimelineRecordState.Pending;

            }

            // Validate failed approvals attempts
            // Cancel run progress if unable to approve
            if (approval.state !== TimelineRecordState.Completed) {

                await this.validateApproval(stage, build, settings);

            }

        }

        return stage;

    }

    public async check(stage: IBuildStage, build: Build, settings: ISettings): Promise<IBuildStage> {

        stage.attempt.check++;

        this.logger.log(`Stage <${stage.name}> (${stage.id}) is pending checks (attempt ${stage.attempt.check})`);

        const pendingChecks: IBuildCheck[] = stage.checks.filter(
            (check) => check.state !== TimelineRecordState.Completed);

        if (pendingChecks.length) {

            // Validate pending checks attempts
            // Cancel run progress if unable proceed
            await this.validateCheck(stage, build, settings);

        }

        return stage;

    }

    private async validateApproval(stage: IBuildStage, build: Build, settings: ISettings): Promise<void> {

        const debug = this.debugLogger.extend(this.validateApproval.name);

        const limitExceeded: boolean = stage.attempt.approval > settings.approvalAttempts;

        if (limitExceeded) {

            const limitMinutes: number = Math.floor((settings.approvalAttempts * settings.approvalInterval) / 60000);

            this.logger.warn(`Stage <${stage.name}> (${stage.id}) approval <${limitMinutes}> minute(s) time limit exceeded`);

            if (settings.cancelFailedCheckpoint) {

                this.logger.log(`Cancelling <${build.buildNumber}> (${build.id}) run <${BuildStatus[build.status!]}> progress`);

                const canceledBuild: Build = await this.buildSelector.cancelBuild(build);

                debug(canceledBuild);

            }

            throw new Error(`Unable to complete <${stage.name}> (${stage.id}) stage approval`);

        } else {

            this.logger.warn(`Stage <${stage.name}> (${stage.id}) cannot be approved`);

            await this.commonHelper.wait(settings.approvalInterval);

        }

    }

    public async validateCheck(stage: IBuildStage, build: Build, settings: ISettings): Promise<void> {

        const debug = this.debugLogger.extend(this.validateCheck.name);

        const limitExceeded: boolean = stage.attempt.check > settings.approvalAttempts;

        if (limitExceeded) {

            const limitMinutes: number = Math.floor((settings.approvalAttempts * settings.approvalInterval) / 60000);

            this.logger.warn(`Stage <${stage.name}> (${stage.id}) check <${limitMinutes}> minute(s) time limit exceeded`);

            if (settings.cancelFailedCheckpoint) {

                this.logger.log(`Cancelling <${build.buildNumber}> (${build.id}) build <${BuildStatus[build.status!]}> progress`);

                const canceledBuild: Build = await this.buildSelector.cancelBuild(build);

                debug(`Build <${build.buildNumber}> (${build.id}) reported <${BuildStatus[canceledBuild.status!]}> status`);

            }

            throw new Error(`Unable to validate <${stage.name}> (${stage.id}) stage checks`);

        } else {

            await this.commonHelper.wait(settings.approvalInterval);

        }

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
