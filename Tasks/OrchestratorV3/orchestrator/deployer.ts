import { String } from "typescript-string-operations";

import { Release, ReleaseEnvironment, EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

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
import { IApprover } from "../interfaces/orchestrator/approver";
import { IReporter } from "../interfaces/orchestrator/reporter";

export class Deployer implements IDeployer {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    private commonHelper: ICommonHelper;
    private releaseHelper: IReleaseHelper;
    private releaseApprover: IApprover;
    private progressMonitor: IMonitor;
    private progressReporter: IReporter;

    constructor(commonHelper: ICommonHelper, releaseHelper: IReleaseHelper, releaseApprover: IApprover, progressMonitor: IMonitor, progressReporter: IReporter, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.commonHelper = commonHelper;
        this.releaseHelper = releaseHelper;
        this.releaseApprover = releaseApprover;
        this.progressMonitor = progressMonitor;
        this.progressReporter = progressReporter;

    }

    public async deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        const releaseProgress: IReleaseProgress = this.progressMonitor.createProgress(releaseJob);

        const pendingStages: IStageProgress[] = this.progressMonitor.getPendingStages(releaseProgress);

        debug(`Starting <${releaseProgress.name}> (${releaseProgress.id}) release <${ReleaseStatus[releaseProgress.status]}> progress tracking`);

        for (const stage of pendingStages) {

            debug(`Monitoring <${stage.name}> (${stage.id}) stage deployment <${EnvironmentStatus[stage.status]}> progress`);

            let releaseStatus: Release = await this.releaseHelper.getReleaseStatus(releaseJob.project.name!, releaseJob.release.id!);
            let stageStatus: ReleaseEnvironment = await this.releaseHelper.getStageStatus(releaseStatus, stage.name);

            this.progressMonitor.updateStageProgress(stage, stageStatus);

            const pending: boolean = this.progressMonitor.isStagePending(stage);

            // Start pending stage deployment process
            // Or skip deployment if stage in progress
            if (pending) {

                this.consoleLogger.log(`Manually starting <${stage.name}> (${stage.id}) stage deployment`);

                const startMessage: string = `Requested via <${details.releaseName}> (${details.projectName}) by ${details.requesterName}`;

                // Start stage deployment
                stageStatus = await this.releaseHelper.startStage(stageStatus, releaseJob.project.name!, startMessage);

                this.progressMonitor.updateStageProgress(stage, stageStatus);

            }

            let completed: boolean = this.progressMonitor.isStageCompleted(stage);

            do {

                debug(`Updating <${stage.name}> (${stage.id}) stage <${EnvironmentStatus[stage.status]}> status`);

                releaseStatus = await this.releaseHelper.getReleaseStatus(releaseJob.project.name!, releaseJob.release.id!);
                stageStatus = await this.releaseHelper.getStageStatus(releaseStatus, stage.name);

                const approved: boolean = await this.releaseApprover.isStageApproved(stage, stageStatus);

                if (!approved) {

                    // Approve stage deployment and validate outcome
                    // Use retry mechanism to check manual approval status
                    // Cancel stage deployment when retry count exceeded
                    await this.releaseApprover.approveStage(stage, stageStatus, releaseJob.project.name!, details, releaseJob.settings);

                }

                this.progressMonitor.updateStageProgress(stage, stageStatus);
                this.progressMonitor.updateReleaseProgress(releaseProgress);

                completed = this.progressMonitor.isStageCompleted(stage);

                if (completed) {

                    this.consoleLogger.log(`Stage <${stage.name}> (${stage.id}) reported <${EnvironmentStatus[stage.status]}> status`);

                    this.consoleLogger.log(
                        this.progressReporter.getStageProgress(stage));

                    break;

                }

                // Wait before next stage status update
                await this.commonHelper.wait(releaseJob.settings.sleep);

            } while (!completed);

        }

        this.consoleLogger.log(`All release stages <${String.Join("|", releaseJob.stages)}> deployment completed`);

        this.consoleLogger.log(
            this.progressReporter.getStagesProgress(releaseProgress.stages));

        return releaseProgress;

    }

    public async deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        const releaseProgress: IReleaseProgress = this.progressMonitor.createProgress(releaseJob);

        debug(`Starting <${releaseProgress.name}> (${releaseProgress.id}) release <${ReleaseStatus[releaseProgress.status]}> progress tracking`);

        do {

            debug(`Monitoring <${String.Join("|", releaseProgress.stages.map((stage) => stage.name))}> stage(s) deployment progress`);

            const releaseStatus: Release = await this.releaseHelper.getReleaseStatus(releaseJob.project.name!, releaseJob.release.id!);

            const activeStages: IStageProgress[] = this.progressMonitor.getActiveStages(releaseProgress);

            for (const stage of activeStages) {

                debug(`Updating <${stage.name}> (${stage.id}) stage <${EnvironmentStatus[stage.status]}> status`);

                const stageStatus: ReleaseEnvironment = await this.releaseHelper.getStageStatus(releaseStatus, stage.name);

                const approved: boolean = await this.releaseApprover.isStageApproved(stage, stageStatus);

                if (!approved) {

                    // Approve stage deployment and validate outcome
                    // Use retry mechanism to check manual approval status
                    // Cancel stage deployment when retry count exceeded
                    await this.releaseApprover.approveStage(stage, stageStatus, releaseJob.project.name!, details, releaseJob.settings);

                }

                this.progressMonitor.updateStageProgress(stage, stageStatus);

                const completed: boolean = this.progressMonitor.isStageCompleted(stage);

                if (completed) {

                    this.consoleLogger.log(`Stage <${stage.name}> (${stage.id}) reported <${EnvironmentStatus[stage.status]}> status`);

                    this.consoleLogger.log(
                        this.progressReporter.getStageProgress(stage));

                    break;

                }

            }

            this.progressMonitor.updateReleaseProgress(releaseProgress);

            // Wait before next release status update
            if (releaseProgress.status === ReleaseStatus.InProgress) {

                await this.commonHelper.wait(releaseJob.settings.sleep);

            }

        } while (releaseProgress.status === ReleaseStatus.InProgress);

        this.consoleLogger.log(`All release stages <${String.Join("|", releaseJob.stages)}> deployment completed`);

        this.consoleLogger.log(
            this.progressReporter.getStagesProgress(releaseProgress.stages));

        return releaseProgress;

    }

}
