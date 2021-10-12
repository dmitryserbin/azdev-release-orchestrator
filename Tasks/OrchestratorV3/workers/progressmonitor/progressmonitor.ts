/* eslint-disable @typescript-eslint/no-explicit-any */

import { String } from "typescript-string-operations";

import { ApprovalStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IProgressMonitor } from "./iprogressmonitor";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { RunStatus } from "../../orchestrator/runstatus";
import { IStageApproval } from "../stageapprover/istageapproval";
import { IStageProgress } from "../../orchestrator/istageprogress";
import { IRunStage } from "../runcreator/irunstage";
import { IBuildStage } from "./ibuildstage";
import { StageState } from "./stagestate";
import { StageResult } from "./stageresult";

export class ProgressMonitor implements IProgressMonitor {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public createRunProgress(run: IRun): IRunProgress {

        const debug = this.debugLogger.extend(this.createRunProgress.name);

        const runProgress: IRunProgress = {

            id: run.build.id!,
            name: run.build.buildNumber!,
            project: run.project.name!,
            url: `${run.project._links.web.href}/_build/results?buildId=${run.build.id}`,
            stages: [],
            status: RunStatus.InProgress,

        };

        const targetStages: IRunStage[] = run.stages.filter((stage) => stage.target === true);

        for (const stage of targetStages) {

            const approvalStatus: IStageApproval = {

                status: ApprovalStatus.Pending,
                retry: 0,

            };

            const stageProgress: IStageProgress = {

                name: stage.name,
                id: stage.id,
                approval: approvalStatus,
                state: StageState.NotStarted,
                result: StageResult.Zero,

            };

            runProgress.stages.push(stageProgress);

        }

        debug(runProgress);

        return runProgress;

    }
    
    public updateRunProgress(runProgress: IRunProgress): IRunProgress {

        const debug = this.debugLogger.extend(this.updateRunProgress.name);

        const completedStages: string[] = runProgress.stages.filter(
            (stage) => this.isStageCompleted(stage)).map(
                (stage) => stage.name);

        const activeStages: string[] = runProgress.stages.filter(
            (stage) => this.isStageActive(stage)).map(
                (stage) => stage.name);

        const allStagesCompleted: boolean = completedStages.length === runProgress.stages.length;

        if (allStagesCompleted) {

            debug(`All run stages <${String.Join("|", completedStages)}> completed`);

            // TBU

            runProgress.status = RunStatus.Succeeded;


        } else {

            debug(`Run stages <${String.Join("|", activeStages)}> in progress`);

            runProgress.status = RunStatus.InProgress;

        }

        debug(`Run status <${RunStatus[runProgress.status]}> updated`);

        return runProgress;

    }

    public updateStageProgress(stageProgress: IStageProgress, stageStatus: IBuildStage): IStageProgress {

        const debug = this.debugLogger.extend(this.updateStageProgress.name);

        stageProgress.state = stageStatus.state;

        return stageProgress;

    }

    public getActiveStages(runProgress: IRunProgress): IStageProgress[] {

        const debug = this.debugLogger.extend(this.getActiveStages.name);

        const activeStages: IStageProgress[] = runProgress.stages.filter(
            (stage) => !this.isStageCompleted(stage));

        debug(activeStages);

        return activeStages;

    }

    private isStageCompleted(stageProgress: IStageProgress): boolean {

        const debug = this.debugLogger.extend(this.isStageCompleted.name);

        const status: boolean = stageProgress.state === StageState.Completed;

        if (status) {

            debug(`Stage <${stageProgress.name}> (${StageState[stageProgress.state]}) is completed`);

        }

        return status;

    }

    private isStageActive(stageProgress: IStageProgress): boolean {

        const debug = this.debugLogger.extend(this.isStageActive.name);

        const status: boolean = stageProgress.state !== StageState.Completed;

        if (status) {

            debug(`Stage <${stageProgress.name}> (${StageState[stageProgress.state]}) is active`);

        }

        return status;

    }

}
