import Debug from "debug";

import { Release, ReleaseEnvironment, EnvironmentStatus, ApprovalStatus, ReleaseApproval, ReleaseEnvironmentUpdateMetadata } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDetails } from "../interfaces/task/details";
import { IDeployer } from "../interfaces/workers/deployer";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseJob } from "../interfaces/orchestrator/releasejob";
import { IMonitor } from "../interfaces/orchestrator/monitor";
import { Monitor } from "../orchestrator/monitor";
import { IStageProgress } from "../interfaces/orchestrator/stageprogress";
import { IReleaseProgress } from "../interfaces/orchestrator/releaseprogress";
import { ReleaseStatus } from "../interfaces/orchestrator/releasestatus";

export class Deployer implements IDeployer {

    private debugLogger: Debug.Debugger;
    private consoleLogger: IConsoleLogger;

    private coreHelper: ICoreHelper;
    private releaseHelper: IReleaseHelper;
    private progressMonitor: IMonitor;

    constructor(coreHelper: ICoreHelper, releaseHelper: IReleaseHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.coreHelper = coreHelper;
        this.releaseHelper = releaseHelper;

        this.progressMonitor = new Monitor(debugLogger);

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

                const approvalRequired: boolean =
                    stage.approval.status === ApprovalStatus.Undefined ||
                    stage.approval.status === ApprovalStatus.Pending;

                if (approvalRequired) {

                    // Approve stage deployment and validate outcome
                    // Use retry mechanism to check manual approval status
                    // Cancel stage deployment when retry count exceeded
                    await this.approveStage(stage, stageStatus, releaseJob.project.name!, details);

                }

                this.progressMonitor.updateStageProgress(stage, stageStatus);

                const completed: boolean = this.progressMonitor.isStageCompleted(stage);

                if (completed) {

                    debug(`Stage <${stage.name}> deployment <${EnvironmentStatus[stage.status]}> completed`);

                    break;

                }

            }

            this.progressMonitor.updateReleaseProgress(releaseProgress);

            await this.wait(releaseJob.sleep);

        } while (releaseProgress.status === ReleaseStatus.InProgress);

        return releaseProgress;

    }

    private async approveStage(progress: IStageProgress, stage: ReleaseEnvironment, projectName: string, details: IDetails, retry: number = 60, sleep: number = 60000): Promise<void> {

        const debug = this.debugLogger.extend(this.approveStage.name);

        // Get pending approvals
        const pendingApprovals: ReleaseApproval[] = stage.preDeployApprovals!.filter((i) =>
            i.status === ApprovalStatus.Pending);

        if (pendingApprovals.length > 0) {

            progress.approval.count++;

            console.log(`Approving <${stage.name}> (${stage.id}) stage deployment (retry ${progress.approval.count})`);

            // Approve pending requests in sequence
            // To support multiple approvals scenarios
            for (const request of pendingApprovals) {

                debug(request);

                // Update status
                progress.approval.status = request.status!;

                try {

                    const releaseApproval: ReleaseApproval = {

                        status: ApprovalStatus.Approved,
                        comments: `Approved by Azure DevOps release orchestrator`,

                    };

                    // Approve
                    const requestStatus: ReleaseApproval = await this.releaseHelper.updateApproval(releaseApproval, projectName, request.id!);

                    progress.approval.status = requestStatus.status!;

                    // Stop loop is approval succeeded
                    // No need to approve following request
                    if (requestStatus.status === ApprovalStatus.Approved) {

                        console.log(`Stage <${stage.name}> (${stage.id}) deployment successfully approved`);

                        break;

                    }

                } catch {

                    progress.approval.status = ApprovalStatus.Rejected;

                }

            }

            // Validate unsuccessful approval
            if (progress.approval.status === ApprovalStatus.Rejected) {

                // Wait and retry approval
                if (progress.approval.count < retry) {

                    console.warn(`Stage <${stage.name}> (${stage.id}) cannot be approved by <${details.releaseName}> (${details.endpointName})`);

                    await this.wait(sleep);

                // Cancel stage deployment
                } else {

                    console.warn(`Stage <${stage.name}> (${stage.id}) approval waiting time limit exceeded`);

                    const stageSatus: ReleaseEnvironmentUpdateMetadata = {

                        status: EnvironmentStatus.Canceled,
                        comment: "Approval waiting time limit exceeded",

                    };

                    const releaseStage: ReleaseEnvironment = await this.releaseHelper.updateStage(stageSatus, projectName, stage.release!.id!, stage.id!);

                    debug(releaseStage);

                }

            }

        }

        debug(`Stage <${stage.name}> approval status <${ApprovalStatus[progress.approval.status!]}> retrieved`);

    }

    public async isAutomated(releaseJob: IReleaseJob): Promise<boolean> {

        const debug = this.debugLogger.extend(this.isAutomated.name);

        const status: boolean = await this.releaseHelper.getConditionsStatus(releaseJob.release);

        debug(status);

        return status;

    }

    private async wait(count: number): Promise<void> {

        const debug = this.debugLogger.extend(this.wait.name);

        debug(`Waiting <${count}> milliseconds`);

        return new Promise((resolve) => setTimeout(resolve, count));

    }

}
