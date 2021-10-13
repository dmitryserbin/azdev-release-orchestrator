/* eslint-disable @typescript-eslint/no-explicit-any */

import { String } from "typescript-string-operations";

import { TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IProgressMonitor } from "./iprogressmonitor";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { RunStatus } from "../../orchestrator/runstatus";
import { IStageProgress } from "../../orchestrator/istageprogress";
import { IRunStage } from "../runcreator/irunstage";
import { IBuildStage } from "./ibuildstage";

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

            const stageProgress: IStageProgress = {

                name: stage.name,
                id: stage.id,
                startTime: undefined,
                finishTime: undefined,
                state: TimelineRecordState.Pending,
                result: undefined,
                jobs: [],

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

        stageProgress.startTime = stageStatus.startTime;
        stageProgress.finishTime = stageStatus.finishTime;
        stageProgress.state = stageStatus.state;
        stageProgress.result = stageStatus.result;
        stageProgress.jobs = stageStatus.jobs;

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

        const status: boolean = stageProgress.state === TimelineRecordState.Completed;

        if (status) {

            debug(`Stage <${stageProgress.name}> (${TimelineRecordState[stageProgress.state!]}) is completed`);

        }

        return status;

    }

    private isStageActive(stageProgress: IStageProgress): boolean {

        const debug = this.debugLogger.extend(this.isStageActive.name);

        const status: boolean = stageProgress.state !== TimelineRecordState.Completed;

        if (status) {

            debug(`Stage <${stageProgress.name}> (${TimelineRecordState[stageProgress.state!]}) is active`);

        }

        return status;

    }

}
