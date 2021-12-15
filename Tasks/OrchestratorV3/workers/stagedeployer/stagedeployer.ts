import { Build, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { ICommonHelper } from "../../helpers/commonhelper/icommonhelper";

import { IStageSelector } from "../../helpers/stageselector/istageselector";
import { ISettings } from "../../helpers/taskhelper/isettings";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IBuildStage } from "../progressmonitor/ibuildstage";
import { IProgressReporter } from "../progressreporter/iprogressreporter";
import { IStageApprover } from "../stageapprover/istageapprover";
import { IStageDeployer } from "./istagedeployer";

export class StageDeployer implements IStageDeployer {

    private logger: ILogger;
    private debugLogger: IDebug;

    private commonHelper: ICommonHelper;
    private stageSelector: IStageSelector;
    private stageApprover: IStageApprover;
    private progressReporter: IProgressReporter;

    constructor(commonHelper: ICommonHelper, stageSelector: IStageSelector, stageApprover: IStageApprover, progressReporter: IProgressReporter, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.stageSelector = stageSelector;
        this.stageApprover = stageApprover;
        this.commonHelper = commonHelper;
        this.progressReporter = progressReporter;

    }

    public async deployManual(stage: IBuildStage, build: Build, settings: ISettings): Promise<IBuildStage> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        debug(`Starting <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress`);

        let inProgress: boolean = true;

        // Manually start pending stage process
        if (stage.state === TimelineRecordState.Pending) {

            this.logger.log(`Manually starting <${stage.name}> (${stage.id}) stage progress`);

            await this.stageSelector.startStage(build, stage);

            if (!settings.proceedSkippedStages) {

                stage = await this.stageSelector.confirmStage(build, stage, 12);

            }

        }

        do {

            debug(`Updating <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress`);

            stage = await this.stageSelector.getStage(build, stage);

            if (settings.skipTracking) {

                this.logger.log(`Skipping <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress tracking`);

                inProgress = false;

                continue;

            }

            if (stage.state === TimelineRecordState.Pending && settings.proceedSkippedStages) {

                this.logger.log(`Pending stage <${stage.name}> (${stage.id}) cannot be started`);

                inProgress = false;

                continue;

            }

            if (stage.checkpoint?.state !== TimelineRecordState.Completed) {

                if (this.stageApprover.isApprovalPeding(stage)) {

                    // Approve stage progress and validate outcome
                    // Cancel run progress if unable to approve with retry
                    stage = await this.stageApprover.approve(stage, build, settings);

                }

                if (this.stageApprover.isCheckPeding(stage)) {

                    // Validate stage progress checks status
                    // Cancel run progress if checks pending with retry
                    stage = await this.stageApprover.check(stage, build, settings);

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

            await this.commonHelper.wait(settings.updateInterval);

        } while (inProgress);

        return stage;

    }

    public async deployAutomated(stage: IBuildStage, build: Build, settings: ISettings): Promise<IBuildStage> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        debug(`Updating <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress`);

        stage = await this.stageSelector.getStage(build, stage);

        if (settings.skipTracking) {

            this.logger.log(`Skipping <${stage.name}> (${stage.id}) stage <${TimelineRecordState[stage.state!]}> progress tracking`);

            return stage;

        }

        if (stage.checkpoint?.state !== TimelineRecordState.Completed) {

            if (this.stageApprover.isApprovalPeding(stage)) {

                // Approve stage progress and validate outcome
                // Cancel run progress if unable to approve with retry
                stage = await this.stageApprover.approve(stage, build, settings);

            }

            if (this.stageApprover.isCheckPeding(stage)) {

                // Validate stage progress checks status
                // Cancel run progress if checks pending with retry
                stage = await this.stageApprover.check(stage, build, settings);

            }

        }

        if (stage.state === TimelineRecordState.Completed) {

            this.logger.log(`Stage <${stage.name}> (${stage.id}) reported <${TimelineRecordState[stage.state!]}> state`);

            // Do not print empty stage job progress
            // Rejected stages do not contain any jobs
            if (stage.jobs.length) {

                this.progressReporter.logStageProgress(stage);

            }

        }

        return stage;

    }

}