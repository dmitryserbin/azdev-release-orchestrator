import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IProgressMonitor } from "./iprogressmonitor";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { RunStatus } from "../../orchestrator/runstatus";
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

            const buildStage: IBuildStage = {

                id: stage.id,
                name: stage.name,
                startTime: null,
                finishTime: null,
                state: TimelineRecordState.Pending,
                result: null,
                checkpoint: null,
                approvals: [],
                checks: [],
                jobs: [],
                attempt: {
                    stage: 0,
                    approval: 0,
                    check: 0,
                },

            };

            runProgress.stages.push(buildStage);

        }

        debug(runProgress);

        return runProgress;

    }

    public updateRunProgress(runProgress: IRunProgress): IRunProgress {

        const debug = this.debugLogger.extend(this.updateRunProgress.name);

        const completedStages: string[] = runProgress.stages.filter(
            (stage) => this.isStageCompleted(stage)).map((stage) => stage.name);

        const activeStages: string[] = runProgress.stages.filter(
            (stage) => this.isStageActive(stage)).map((stage) => stage.name);

        const allStagesCompleted: boolean = completedStages.length === runProgress.stages.length;

        if (allStagesCompleted) {

            debug(`All run stages <${completedStages?.join("|")}> completed`);

            // Get non-succeeded stages
            const nonSucceededStages: boolean = this.isNonSucceededStages(runProgress.stages);

            if (nonSucceededStages) {

                runProgress.status = RunStatus.Failed;

            } else {

                // Get succeeded with issues stages
                const succeededWithIssuesStages: boolean = this.isSucceededWithIssuesStages(runProgress.stages);

                if (succeededWithIssuesStages) {

                    runProgress.status = RunStatus.PartiallySucceeded;

                } else {

                    runProgress.status = RunStatus.Succeeded;

                }

            }

        } else {

            debug(`Run stages <${activeStages?.join("|")}> in progress`);

            runProgress.status = RunStatus.InProgress;

        }

        debug(`Run status <${RunStatus[runProgress.status]}> updated`);

        return runProgress;

    }

    public getActiveStages(runProgress: IRunProgress): IBuildStage[] {

        const debug = this.debugLogger.extend(this.getActiveStages.name);

        const activeStages: IBuildStage[] = runProgress.stages.filter(
            (stage) => !this.isStageCompleted(stage));

        debug(activeStages);

        return activeStages;

    }

    private isStageCompleted(stage: IBuildStage): boolean {

        const debug = this.debugLogger.extend(this.isStageCompleted.name);

        const status: boolean = stage.state === TimelineRecordState.Completed;

        if (status) {

            debug(`Stage <${stage.name}> (${TimelineRecordState[stage.state!]}) is completed`);

        }

        return status;

    }

    private isStageActive(stage: IBuildStage): boolean {

        const debug = this.debugLogger.extend(this.isStageActive.name);

        const status: boolean = stage.state !== TimelineRecordState.Completed;

        if (status) {

            debug(`Stage <${stage.name}> (${TimelineRecordState[stage.state!]}) is active`);

        }

        return status;

    }

    private isNonSucceededStages(stages: IBuildStage[]): boolean {

        const nonSucceeded: boolean = stages.filter(
            (stage) =>
                stage.result === TaskResult.Failed ||
                stage.result === TaskResult.Canceled ||
                stage.result === TaskResult.Abandoned).length > 0;

        return nonSucceeded;

    }

    private isSucceededWithIssuesStages(stages: IBuildStage[]): boolean {

        const succeededWithIssues: boolean = stages.filter(
            (stage) => stage.result === TaskResult.SucceededWithIssues).length > 0;

        return succeededWithIssues;

    }

}
