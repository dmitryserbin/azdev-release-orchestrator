import Table from "cli-table";
import Moment from "moment";

import { ApprovalStatus, EnvironmentStatus, TaskStatus, ReleaseTask, DeploymentReason } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";
import { IStageProgress } from "../interfaces/common/stageprogress";
import { ReleaseStatus } from "../interfaces/common/releasestatus";
import { IFilters } from "../interfaces/task/filters";

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
            "Release",
            "Trigger",
            "Tasks",
            "Attempt",
            "Approval",
            "Status",
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

    public getFilters(filters: IFilters): string {

        const debug = this.debugLogger.extend(this.getFilters.name);

        const table: Table = this.newTable([

            "Release tag(s)",
            "Artifact tag(s)",
            "Artifact branch",

        ]);

        const result: any[] = this.newFiltersResult(filters);

        table.push(result);

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

        const tasksCount: number = this.getTasksCount(stage);

        const result: any[] = [

            stage.id ? stage.id : "-",
            stage.name ? stage.name : "-",
            stage.release ?  stage.release : "-",
            stage.deployment!.reason ? DeploymentReason[stage.deployment!.reason] : "-",
            tasksCount > 0 ? tasksCount : "-",
            stage.deployment!.attempt ? stage.deployment!.attempt : "-",
            stage.approval.status ? ApprovalStatus[stage.approval.status] : "-",
            stage.status ? EnvironmentStatus[stage.status] : "-",
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

    private newFiltersResult(filters: IFilters): any[] {

        const result: any[] = [

            filters.releaseTags.length ? filters.releaseTags : "-",
            filters.artifactTags.length ? filters.artifactTags : "-",
            filters.artifactBranch ? filters.artifactBranch : "-",

        ];

        return result;

    }

    private getTasksCount(stage: IStageProgress): number {

        const tasks: ReleaseTask[] = [];

        stage.deployment!.releaseDeployPhases!.forEach(
            (phase) => phase.deploymentJobs!.forEach(
                (job) => job.tasks?.forEach(
                    (task) => tasks.push(task))));

        return tasks.length;

    }

    private newTable(headers: string[], widths: number[] = []): Table {

        const options: any = {

            head: headers,
            widths: widths,

        };

        const table: Table = new Table(options);

        return table;

    }

}
