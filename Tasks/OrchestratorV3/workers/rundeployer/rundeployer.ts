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
import { IStageProgress } from "../../orchestrator/istageprogress";
import { IBuildStage } from "../progressmonitor/ibuildstage";
import { IBuildMonitor } from "../../helpers/buildmonitor/ibuildmonitor";
import { IStageApprover } from "../stageapprover/istageapprover";

export class RunDeployer implements IRunDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    private commonHelper: ICommonHelper;
    private buildMonitor: IBuildMonitor;
    private stageApprover: IStageApprover;
    private progressMonitor: IProgressMonitor;
    private progressReporter: IProgressReporter;

    constructor(commonHelper: ICommonHelper, buildMonitor: IBuildMonitor, stageApprover: IStageApprover, progressMonitor: IProgressMonitor, progressReporter: IProgressReporter, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.buildMonitor = buildMonitor;
        this.stageApprover = stageApprover;
        this.commonHelper = commonHelper;
        this.progressMonitor = progressMonitor;
        this.progressReporter = progressReporter;

    }

    public async deployManual(run: IRun): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        const runProgress: IRunProgress = this.progressMonitor.createRunProgress(run);

        debug(`Starting <${runProgress.name}> (${runProgress.id}) run <${RunStatus[runProgress.status]}> progress tracking`);

        return runProgress;

    }

    public async deployAutomated(run: IRun): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        let runProgress: IRunProgress = this.progressMonitor.createRunProgress(run);

        this.logger.log(`Starting <${runProgress.name}> (${runProgress.id}) run <${RunStatus[runProgress.status]}> progress tracking`);

        let inProgress: boolean = true;

        while (inProgress) {

            debug(`Updating <${String.Join("|", runProgress.stages.map((stage) => stage.name))}> active stage(s) progress`);

            const activeStages: IStageProgress[] = this.progressMonitor.getActiveStages(runProgress);

            for (let stage of activeStages) {

                debug(`Updating <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress`);

                const stageStatus: IBuildStage = await this.buildMonitor.getStageStatus(run.build, stage.name);

                if (stageStatus.checks) {

                    const stageChecks: unknown = await this.stageApprover.getChecks(run.build, stageStatus);

                    if (this.stageApprover.isApprovalPeding(stageChecks)) {

                        // Approve stage prgoress and validate outcome
                        // Use retry mechanism to check manual approval status
                        // Cancel stage progress when retry count exceeded
                        stage = await this.stageApprover.approve(stage);

                    }

                    if (this.stageApprover.isCheckPeding(stageChecks)) {

                        this.logger.log(`Stage <${stage.name}> is waiting for checks`);

                    }

                }

                stage = this.progressMonitor.updateStageProgress(stage, stageStatus);

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

                // Wait before next status update
                await this.commonHelper.wait(run.settings.sleep);

            } else {

                inProgress = false;

            }

        }

        this.logger.log(`Run <${runProgress.name}> (${runProgress.id}) progress <${RunStatus[runProgress.status]}> tracking completed`);

        this.progressReporter.logStagesProgress(runProgress.stages)

        return runProgress;

    }

}
