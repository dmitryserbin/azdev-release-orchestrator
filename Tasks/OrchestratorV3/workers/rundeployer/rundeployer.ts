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

export class RunDeployer implements IRunDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    private buildMonitor: IBuildMonitor;
    private commonHelper: ICommonHelper;
    private progressMonitor: IProgressMonitor;
    private progressReporter: IProgressReporter;

    constructor(buildMonitor: IBuildMonitor, commonHelper: ICommonHelper, progressMonitor: IProgressMonitor, progressReporter: IProgressReporter, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.buildMonitor = buildMonitor;
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

                stage = this.progressMonitor.updateStageProgress(stage, stageStatus);

                if (stage.state === TimelineRecordState.Completed) {

                    this.logger.log(`Stage <${stage.name}> (${stage.id}) reported <${TimelineRecordState[stage.state!]}> state`);

                    this.progressReporter.logStageProgress(stage);

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

        this.logger.log(`All target <${String.Join("|", run.stages.filter((stage) => stage.target === true).map((stage) => stage.name))}> stages execution completed`);

        this.progressReporter.logStagesProgress(runProgress.stages)

        return runProgress;

    }

}
