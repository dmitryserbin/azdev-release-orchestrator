import { String } from "typescript-string-operations";

import { IRunDeployer } from "./irundeployer";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { IProgressMonitor } from "../progressmonitor/iprogressmonitor";
import { RunStatus } from "../../orchestrator/runstatus";
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper";
import { EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { IProgressReporter } from "../progressreporter/iprogressreporter";
import { IStageProgress } from "../../orchestrator/istageprogress";

export class RunDeployer implements IRunDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    private commonHelper: ICommonHelper;
    private progressMonitor: IProgressMonitor;
    private progressReporter: IProgressReporter;

    constructor(commonHelper: ICommonHelper, progressMonitor: IProgressMonitor, progressReporter: IProgressReporter, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.commonHelper = commonHelper;
        this.progressMonitor = progressMonitor;
        this.progressReporter = progressReporter;

    }

    public async deployManual(run: IRun): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        const runProgress: IRunProgress = this.progressMonitor.createProgress(run);

        debug(`Starting <${runProgress.name}> (${runProgress.id}) run <${RunStatus[runProgress.status]}> progress tracking`);

        return runProgress;

    }

    public async deployAutomated(run: IRun): Promise<IRunProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        const runProgress: IRunProgress = this.progressMonitor.createProgress(run);

        debug(`Starting <${runProgress.name}> (${runProgress.id}) run <${RunStatus[runProgress.status]}> progress tracking`);

        let inProgress: boolean = true;

        while (inProgress) {

            debug(`Monitoring <${String.Join("|", runProgress.stages.map((stage) => stage.name))}> stage(s) progress`);

            const activeStages: IStageProgress[] = [];

            for (const stage of activeStages) {

                debug(`Updating <${stage.name}> (${stage.id}) stage <${EnvironmentStatus[stage.status]}> status`);

                const stageCompleted: boolean = true;

                if (stageCompleted) {

                    this.logger.log(`Stage <${stage.name}> (${stage.id}) reported <${EnvironmentStatus[stage.status]}> status`);

                    this.progressReporter.logStageProgress(stage);

                    break;

                }

            }

            inProgress = false;

            if (runProgress.status === RunStatus.InProgress) {

                // Wait before next status update
                await this.commonHelper.wait(run.settings.sleep);

            }

        }

        this.progressReporter.logStagesProgress(runProgress.stages)

        return runProgress;

    }

}
