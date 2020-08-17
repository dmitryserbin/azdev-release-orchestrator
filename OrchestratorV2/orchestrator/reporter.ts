import Table from "cli-table";
import Moment from "moment";

import { ApprovalStatus, EnvironmentStatus, ReleaseEnvironment, DeploymentAttempt, DeployPhaseStatus, TaskStatus, ReleaseTask } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";
import { IStageProgress } from "../interfaces/common/stageprogress";
import { ReleaseStatus } from "../interfaces/common/releasestatus";

export class Reporter implements IReporter {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    constructor(debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

    }

    public async displayReleaseProgress(releaseProgress: IReleaseProgress): Promise<void> {

        const debug = this.debugLogger.extend(this.displayReleaseProgress.name);

        const table: Table = this.newTable([

            "ID",
            "Name",
            "Status",
            "Summary",

        ]);

        const releaseResult: any[] = this.newReleaseResult(releaseProgress);

        table.push(releaseResult);

        this.consoleLogger.log(table.toString());

    }

    public async displayStagesProgress(stagesProgress: IStageProgress[]): Promise<void> {

        const debug = this.debugLogger.extend(this.displayStagesProgress.name);

        const table: Table = this.newTable([

            "ID",
            "Release",
            "Name",
            "Approval",
            "Status",
            "Duration",

        ]);

        for (const stage of stagesProgress) {

            const stageResult: any[] = this.newStageResult(stage);

            table.push(stageResult);

        }

        this.consoleLogger.log(table.toString());

    }

    public async displayPhaseProgress(stage: ReleaseEnvironment): Promise<void> {

        const debug = this.debugLogger.extend(this.displayPhaseProgress.name);

        this.consoleLogger.log(`Stage <${stage.name}> (${stage.id}) deployment <${EnvironmentStatus[stage.status!]}> completed`);

        // Get latest deployment attempt
        const deploymentAttempt: DeploymentAttempt = stage.deploySteps!.sort((left, right) =>
            left.deploymentId! - right.deploymentId!).reverse()[0];

        debug(deploymentAttempt);

        for (const phase of deploymentAttempt.releaseDeployPhases!) {

            this.consoleLogger.log(`Phase <${phase.name}> deployment <${DeployPhaseStatus[phase.status!]}> completed`);

            for (const job of phase.deploymentJobs!) {

                const table: Table = this.newTable([

                    "Task",
                    "Status",
                    "Duration",

                ]);

                for (const task of job.tasks!) {

                    const taskResult: any[] = this.newTaskResult(task);

                    table.push(taskResult);

                }

                this.consoleLogger.log(table.toString());

            }

        }

    }

    public newReleaseResult(releaseProgress: IReleaseProgress): any[] {

        const releaseResult: any[] = [

            releaseProgress.id ? releaseProgress.id : "-",
            releaseProgress.name ? releaseProgress.name : "-",
            releaseProgress.status ? ReleaseStatus[releaseProgress.status] : "-",
            releaseProgress.url ? releaseProgress.url : "-",

        ];

        return releaseResult;

    }

    private newStageResult(stage: IStageProgress): any[] {

        const stageResult: any[] = [

            stage.id ? stage.id : "-",
            stage.release ?  stage.release : "-",
            stage.name ? stage.name : "-",
            stage.approval.status ? ApprovalStatus[stage.approval.status] : "-",
            stage.status ? EnvironmentStatus[stage.status] : "-",
            stage.duration ? Moment.duration(stage.duration, "minute").humanize() : "-",

        ];

        return stageResult;

    }

    private newTaskResult(task: ReleaseTask): any[] {

        const taskResult: any[] = [

            task.name ? task.name : "-",
            task.status ? TaskStatus[task.status] : "-",
            task.startTime && task.finishTime
                ? Moment.duration(new Date(task.startTime).getTime() - new Date (task.finishTime).getTime()).humanize() : "-",

        ];

        return taskResult;

    }

    private newTable(headers: string[]): Table {

        const table: Table = new Table({

            head: headers,

        });

        return table;

    }

}
