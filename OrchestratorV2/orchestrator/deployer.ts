import { Release, ReleaseEnvironment, EnvironmentStatus, ApprovalStatus, ReleaseApproval, ReleaseEnvironmentUpdateMetadata } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDetails } from "../interfaces/task/details";
import { IDeployer } from "../interfaces/orchestrator/deployer";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { ICommonHelper } from "../interfaces/helpers/commonhelper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseJob } from "../interfaces/common/releasejob";
import { IMonitor } from "../interfaces/orchestrator/monitor";
import { IStageProgress } from "../interfaces/common/stageprogress";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";
import { ReleaseStatus } from "../interfaces/common/releasestatus";
import { ISettings } from "../interfaces/common/settings";

export class Deployer implements IDeployer {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    private commonHelper: ICommonHelper;
    private releaseHelper: IReleaseHelper;
    private progressMonitor: IMonitor;

    constructor(commonHelper: ICommonHelper, releaseHelper: IReleaseHelper, progressMonitor: IMonitor, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.commonHelper = commonHelper;
        this.releaseHelper = releaseHelper;
        this.progressMonitor = progressMonitor;

    }

    public async deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        this.consoleLogger.log(`Release orchestrated manually as stages deployment conditions are NOT met`);

        const releaseProgress: IReleaseProgress = this.progressMonitor.createProgress(releaseJob.release, releaseJob.stages);

        // TBU

        return releaseProgress;

    }

    public async deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        this.consoleLogger.log(`Release automatically started as stages deployment conditions are met`);

        const releaseProgress: IReleaseProgress = this.progressMonitor.createProgress(releaseJob.release, releaseJob.stages);

        do {

            const releaseStatus: Release = await this.releaseHelper.getReleaseStatus(releaseJob.project.name!, releaseJob.release.id!);

            const activeStages: IStageProgress[] = this.progressMonitor.getActiveStages(releaseProgress);

            for (const stage of activeStages) {

                const stageStatus: ReleaseEnvironment = await this.releaseHelper.getStageStatus(releaseStatus, stage.name);

                const approvalPending: boolean =
                    stage.approval.status === ApprovalStatus.Pending ||
                    stage.approval.status === ApprovalStatus.Rejected;

                if (approvalPending) {

                    // Approve stage deployment and validate outcome
                    // Use retry mechanism to check manual approval status
                    // Cancel stage deployment when retry count exceeded
                    await this.approveStage(stage, stageStatus, releaseJob.project.name!, details, releaseJob.settings);

                }

                this.progressMonitor.updateStageProgress(stage, stageStatus);

                const completed: boolean = this.progressMonitor.isStageCompleted(stage);

                if (completed) {

                    debug(`Stage <${stage.name}> deployment <${EnvironmentStatus[stage.status]}> completed`);

                    break;

                }

            }

            this.progressMonitor.updateReleaseProgress(releaseProgress);

            // Wait before next status update
            if (releaseProgress.status === ReleaseStatus.InProgress) {

                await this.commonHelper.wait(releaseJob.settings.sleep);

            }

        } while (releaseProgress.status === ReleaseStatus.InProgress);

        return releaseProgress;

    }

    private async approveStage(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment, projectName: string, details: IDetails, settings: ISettings): Promise<void> {

        const debug = this.debugLogger.extend(this.approveStage.name);

        // Increment retry count
        stageProgress.approval.count++;

        const pendingApprovals: ReleaseApproval[] = await this.releaseHelper.getStageApprovals(stageStatus, ApprovalStatus.Pending);

        if (pendingApprovals.length <= 0) {

            stageProgress.approval.status = ApprovalStatus.Skipped;

            debug(`Stage <${stageProgress.name}> approval <${ApprovalStatus[stageProgress.approval.status!]}> not required`);

            return;

        }

        this.consoleLogger.log(`Approving <${stageProgress.name}> (${stageStatus.id}) stage deployment (retry ${stageProgress.approval.count})`);

        // Approve pending requests in sequence
        // To support multiple approvals scenarios
        for (const pendingApproval of pendingApprovals) {

            try {

                debug(pendingApproval);

                const approvalRequest: ReleaseApproval = {

                    status: ApprovalStatus.Approved,
                    comments: `Approved by <${details.releaseName}> (${details.endpointName}) release orchestrator`,

                };

                // Approve stage
                const approvalStatus: ReleaseApproval = await this.releaseHelper.updateApproval(approvalRequest, projectName, pendingApproval.id!);

                // Update stage approval status
                stageProgress.approval.status = approvalStatus.status!;

                // No need to approve following request
                // When at least one approval succeeded
                if (approvalStatus.status === ApprovalStatus.Approved) {

                    console.log(`Stage <${stageStatus.name}> (${stageStatus.id}) deployment successfully approved`);

                    break;

                }

            } catch {

                stageProgress.approval.status = ApprovalStatus.Rejected;

            }

        }

        debug(`Stage <${stageStatus.name}> approval status <${ApprovalStatus[stageProgress.approval.status!]}> retrieved`);

        // Validate failed approvals retry attempts
        // Cancel stage deployment if unable to approve
        if (stageProgress.approval.status === ApprovalStatus.Rejected) {

            const retryLimit: boolean = stageProgress.approval.count >= settings.approvalRetry;

            if (retryLimit) {

                const timeLimitMinutes: number = Math.floor((settings.approvalRetry * settings.approvalSleep) / 60000);

                this.consoleLogger.warn(`Stage <${stageStatus.name}> (${stageStatus.id}) approval <${timeLimitMinutes}> minute(s) time limit exceeded`);

                const stageSatus: ReleaseEnvironmentUpdateMetadata = {

                    status: EnvironmentStatus.Canceled,
                    comment: "Approval waiting time limit exceeded",

                };

                debug(`Cancelling <${stageStatus.name}> (${stageStatus.id}) stage deployment`);

                // Cancel stage deployment
                const releaseStage: ReleaseEnvironment = await this.releaseHelper.updateStage(stageSatus, projectName, stageStatus.release!.id!, stageStatus.id!);

                debug(releaseStage);

            } else {

                this.consoleLogger.warn(`Stage <${stageStatus.name}> (${stageStatus.id}) cannot be approved by <${details.releaseName}> (${details.endpointName})`);

                // Wait before next approval retry
                await this.commonHelper.wait(settings.approvalSleep);

            }

        }

    }

}