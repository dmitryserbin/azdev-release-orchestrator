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

        // TBU

        return releaseProgress;

    }

    public async deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        const releaseProgress: IReleaseProgress = this.progressMonitor.createProgress(releaseJob);

        do {

            const releaseStatus: Release = await this.releaseHelper.getReleaseStatus(releaseJob.project.name!, releaseJob.release.id!);

            const activeStages: IStageProgress[] = this.progressMonitor.getActiveStages(releaseProgress);

            for (const stage of activeStages) {

                const stageStatus: ReleaseEnvironment = await this.releaseHelper.getStageStatus(releaseStatus, stage.name);

                const approved: boolean = await this.releaseApprover.isStageApproved(stage, stageStatus);

                if (!approved) {

                    // Approve stage deployment and validate outcome
                    // Use retry mechanism to check manual approval status
                    // Cancel stage deployment when retry count exceeded
                    this.releaseApprover.approveStage(stage, stageStatus, releaseJob.project.name!, details, releaseJob.settings);

                }

                this.progressMonitor.updateStageProgress(stage, stageStatus);

                const completed: boolean = this.progressMonitor.isStageCompleted(stage);

                if (completed) {

                    this.consoleLogger.log(`Stage <${stage.name}> (${stage.id}) deployment <${EnvironmentStatus[stage.status]}> completed`);

                    this.consoleLogger.log(
                        this.progressReporter.getStageProgress(stage));

                    break;

                }

            }

            this.progressMonitor.updateReleaseProgress(releaseProgress);

            // Wait before next status update
            if (releaseProgress.status === ReleaseStatus.InProgress) {

                await this.commonHelper.wait(releaseJob.settings.sleep);

            }

        } while (releaseProgress.status === ReleaseStatus.InProgress);

        this.consoleLogger.log(`All release stages <${releaseJob.stages}> deployment completed`);

        this.consoleLogger.log(
            this.progressReporter.getStagesProgress(releaseProgress.stages));

        return releaseProgress;

    }

}
