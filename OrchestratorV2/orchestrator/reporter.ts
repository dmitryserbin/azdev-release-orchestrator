import Table from "cli-table";
import Moment from "moment";

import { ApprovalStatus, EnvironmentStatus, ReleaseEnvironment, DeploymentAttempt, DeployPhaseStatus, TaskStatus, ReleaseTask } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";
import { IStageProgress } from "../interfaces/common/stageprogress";

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

            "Project",
            "Release",
            "Stage",
            "Approval",
            "Status",

        ]);

        for (const stage of releaseProgress.stages) {

            const stageResult: any[] = this.newStageResult(stage, releaseProgress);

            table.push(stageResult);

        }

        this.consoleLogger.log(table.toString());

        if (releaseProgress.url) {

            this.consoleLogger.log(`Summary: ${releaseProgress.url}`);

        }

    }

    public async displayStageProgress(stage: ReleaseEnvironment): Promise<void> {

        const debug = this.debugLogger.extend(this.displayStageProgress.name);

        this.consoleLogger.log(`Stage <${stage.name}> (${stage.id}) deployment <${EnvironmentStatus[stage.status!]}> completed`);

        // Get latest deployment attempt
        const deploymentAttempt: DeploymentAttempt = stage.deploySteps!.sort((left, right) =>
            left.deploymentId! - right.deploymentId!).reverse()[0];

        debug(deploymentAttempt);

        for (const phase of deploymentAttempt.releaseDeployPhases!) {

            this.consoleLogger.log(`Phase <${phase.name}> deployment <${DeployPhaseStatus[phase.status!]}> completed`);

            for (const job of phase.deploymentJobs!) {

                const table: Table = this.newTable([

                    "Agent",
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

    private newStageResult(stage: IStageProgress, releaseProgress: IReleaseProgress): any[] {

        const stageResult: any[] = [

            releaseProgress.project ? releaseProgress.project : "-",
            releaseProgress.name ? `${releaseProgress.name} (${releaseProgress.id})` : "-",
            stage.name ? stage.name : "-",
            stage.approval.status ? ApprovalStatus[stage.approval.status] : "-",
            stage.status ? EnvironmentStatus[stage.status] : "-",

        ];

        return stageResult;

    }

    private newTaskResult(task: ReleaseTask): any[] {

        const taskResult: any[] = [

            task.agentName ? task.agentName : "-",
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
