import { String } from "typescript-string-operations";

import { TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IRunDeployer } from "./irundeployer";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { IProgressMonitor } from "../progressmonitor/iprogressmonitor";
import { RunStatus } from "../../orchestrator/runstatus";
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper";
import { IProgressReporter } from "../progressreporter/iprogressreporter";
import { IBuildStage } from "../progressmonitor/ibuildstage";
import { IStageSelector } from "../../helpers/stageselector/istageselector";
import { IStageApprover } from "../stageapprover/istageapprover";

export class RunDeployer implements IRunDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    private commonHelper: ICommonHelper;
    private stageSelector: IStageSelector;
    private stageApprover: IStageApprover;
    private progressMonitor: IProgressMonitor;
    private progressReporter: IProgressReporter;

    constructor(commonHelper: ICommonHelper, stageSelector: IStageSelector, stageApprover: IStageApprover, progressMonitor: IProgressMonitor, progressReporter: IProgressReporter, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.stageSelector = stageSelector;
        this.stageApprover = stageApprover;
        this.commonHelper = commonHelper;
        this.progressMonitor = progressMonitor;
        this.progressReporter = progressReporter;

    }

    public async deployManual(run: IRun): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        let runProgress: IRunProgress = this.progressMonitor.createRunProgress(run);

        debug(`Starting <${runProgress.name}> (${runProgress.id}) run <${RunStatus[runProgress.status]}> progress tracking`);

        for (let stage of runProgress.stages) {

            debug(`Starting <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress`);

            let inProgress: boolean = true;

            // Manually start pending stage process
            if (stage.state === TimelineRecordState.Pending) {

                this.logger.log(`Manually starting <${stage.name}> (${stage.id}) stage progress`);

                await this.stageSelector.startStage(run.build, stage);

                // Wait for the stage to initialize
                // Otherwise it may report completed
                await this.commonHelper.wait(15000);

                // Confirm stage is not skipped or pending dependencies
                // To be done only after manual stage start attempt
                if (!run.settings.proceedSkippedStages) {

                    stage = await this.stageSelector.getStage(run.build, stage);

                    await this.stageSelector.confirmStage(stage);

                }

            }

            do {

                debug(`Updating <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress`);

                stage = await this.stageSelector.getStage(run.build, stage);

                if (run.settings.skipTracking) {

                    this.logger.log(`Skipping <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress tracking`);

                    inProgress = false;

                    continue;

                }

                if (stage.state === TimelineRecordState.Pending && run.settings.proceedSkippedStages) {

                    this.logger.log(`Pending stage <${stage.name}> (${stage.id}) cannot be started`);

                    inProgress = false;

                    continue;

                }

                if (stage.checkpoint?.state !== TimelineRecordState.Completed) {

                    if (this.stageApprover.isApprovalPeding(stage)) {

                        // Approve stage progress and validate outcome
                        // Cancel run progress if unable to approve with retry
                        stage = await this.stageApprover.approve(stage, run.build, run.settings);

                    }

                    if (this.stageApprover.isCheckPeding(stage)) {

                        // Validate stage progress checks status
                        // Cancel run progress if checks pending with retry
                        stage = await this.stageApprover.check(stage, run.build, run.settings);

                    }

                }

                if (stage.state === TimelineRecordState.Completed) {

                    this.logger.log(`Stage <${stage.name}> (${stage.id}) reported <${TimelineRecordState[stage.state!]}> state`);

                    // Do not print empty stage job progress
                    // Rejected stages do not contain any jobs
                    if (stage.jobs.length) {

                        this.progressReporter.logStageProgress(stage);

                    }

                    inProgress = false;

                }

                await this.commonHelper.wait(run.settings.updateInterval);

            } while (inProgress);

            runProgress = this.progressMonitor.updateRunProgress(runProgress);

        }

        this.logger.log(`Run <${runProgress.name}> (${runProgress.id}) progress <${RunStatus[runProgress.status]}> tracking ${run.settings.skipTracking ? `skipped` : `completed`}`);

        this.progressReporter.logStagesProgress(runProgress.stages)

        return runProgress;

    }

    public async deployAutomated(run: IRun): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        let runProgress: IRunProgress = this.progressMonitor.createRunProgress(run);

        this.logger.log(`Starting <${runProgress.name}> (${runProgress.id}) run <${RunStatus[runProgress.status]}> progress tracking`);

        let inProgress: boolean = true;

        while (inProgress) {

            debug(`Updating <${String.Join("|", runProgress.stages.map((stage) => stage.name))}> active stage(s) progress`);

            const activeStages: IBuildStage[] = this.progressMonitor.getActiveStages(runProgress);

            for (let stage of activeStages) {

                debug(`Updating <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress`);

                stage = await this.stageSelector.getStage(run.build, stage);

                if (run.settings.skipTracking) {

                    this.logger.log(`Skipping <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress tracking`);

                    continue;

                }

                if (stage.checkpoint?.state !== TimelineRecordState.Completed) {

                    if (this.stageApprover.isApprovalPeding(stage)) {

                        // Approve stage progress and validate outcome
                        // Cancel run progress if unable to approve with retry
                        stage = await this.stageApprover.approve(stage, run.build, run.settings);

                    }

                    if (this.stageApprover.isCheckPeding(stage)) {

                        // Validate stage progress checks status
                        // Cancel run progress if checks pending with retry
                        stage = await this.stageApprover.check(stage, run.build, run.settings);

                    }

                }

                if (stage.state === TimelineRecordState.Completed) {

                    this.logger.log(`Stage <${stage.name}> (${stage.id}) reported <${TimelineRecordState[stage.state!]}> state`);

                    // Do not print empty stage job progress
                    // Rejected stages do not contain any jobs
                    if (stage.jobs.length) {

                        this.progressReporter.logStageProgress(stage);

                    }

                    break;

                }

            }

            runProgress = this.progressMonitor.updateRunProgress(runProgress);

            if (runProgress.status === RunStatus.InProgress) {

                if (run.settings.skipTracking) {

                    inProgress = false;

                }

                await this.commonHelper.wait(run.settings.updateInterval);

            } else {

                inProgress = false;

            }

        }

        this.logger.log(`Run <${runProgress.name}> (${runProgress.id}) progress <${RunStatus[runProgress.status]}> tracking ${run.settings.skipTracking ? `skipped` : `completed`}`);

        this.progressReporter.logStagesProgress(runProgress.stages)

        return runProgress;

    }

}
