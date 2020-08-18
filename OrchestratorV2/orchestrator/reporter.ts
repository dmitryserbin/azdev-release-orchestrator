import Table from "cli-table";
import Moment from "moment";

import { ApprovalStatus, EnvironmentStatus, TaskStatus, ReleaseTask } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";
import { IStageProgress } from "../interfaces/common/stageprogress";
import { ReleaseStatus } from "../interfaces/common/releasestatus";

export class Reporter implements IReporter {

    private debugLogger: IDebugLogger;

    constructor(debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

    }

    public getReleaseProgress(releaseProgress: IReleaseProgress): string {

        const debug = this.debugLogger.extend(this.getReleaseProgress.name);

        const table: Table = this.newTable([

            "ID",
            "Release",
            "Status",
            "Summary",

        ]);

        const releaseResult: any[] = this.newReleaseResult(releaseProgress);

        table.push(releaseResult);

        return table.toString();

    }

    public getStagesProgress(stagesProgress: IStageProgress[]): string {

        const debug = this.debugLogger.extend(this.getStagesProgress.name);

        const table: Table = this.newTable([

            "ID",
            "Stage",
            "Approval",
            "Status",
            "Release",
            "Attempt",
            "Duration",

        ]);

        for (const stage of stagesProgress) {

            const stageResult: any[] = this.newStageResult(stage);

            table.push(stageResult);

        }

        return table.toString();

    }

    public getStageProgress(stageProgress: IStageProgress): string {

        const debug = this.debugLogger.extend(this.getStageProgress.name);

        const table: Table = this.newTable([

            "Agent",
            "Phase",
            "Task",
            "Status",
            "Duration",

        ]);

        for (const phase of stageProgress.deployment?.releaseDeployPhases!) {

            for (const job of phase.deploymentJobs!) {

                for (const task of job.tasks!) {

                    const taskResult: any[] = this.newTaskResult(phase.name!, task);

                    table.push(taskResult);

                }

            }

        }

        return table.toString();

    }

    private newReleaseResult(releaseProgress: IReleaseProgress): any[] {

        const result: any[] = [

            releaseProgress.id ? releaseProgress.id : "-",
            releaseProgress.name ? releaseProgress.name : "-",
            releaseProgress.status ? ReleaseStatus[releaseProgress.status] : "-",
            releaseProgress.url ? releaseProgress.url : "-",

        ];

        return result;

    }

    private newStageResult(stage: IStageProgress): any[] {

        const result: any[] = [

            stage.id ? stage.id : "-",
            stage.name ? stage.name : "-",
            stage.approval.status ? ApprovalStatus[stage.approval.status] : "-",
            stage.status ? EnvironmentStatus[stage.status] : "-",
            stage.release ?  stage.release : "-",
            stage.deployment!.attempt ? stage.deployment!.attempt : "-",
            stage.duration ? Moment.duration(stage.duration, "minute").humanize() : "-",

        ];

        return result;

    }

    private newTaskResult(phaseName: string, task: ReleaseTask): any[] {

        const result: any[] = [

            task.agentName ? task.agentName : "-",
            phaseName,
            task.name ? task.name : "-",
            task.status ? TaskStatus[task.status] : "-",
            task.startTime && task.finishTime
                ? Moment.duration(new Date(task.startTime).getTime() - new Date (task.finishTime).getTime()).humanize() : "-",

        ];

        return result;

    }

    private newTable(headers: string[]): Table {

        const table: Table = new Table({

            head: headers,

        });

        return table;

    }

}
