import Table from "cli-table";
import Moment from "moment";

import { setResult, TaskResult } from "azure-pipelines-task-lib";
import { ApprovalStatus, EnvironmentStatus, ReleaseEnvironment, DeploymentAttempt, DeployPhaseStatus, TaskStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";
import { ReleaseStatus } from "../interfaces/common/releasestatus";

export class Reporter implements IReporter {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    constructor(debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

    }

    public async validateRelease(releaseProgress: IReleaseProgress): Promise<void> {

        const debug = this.debugLogger.extend(this.validateRelease.name);

        const succeededMessage: string = `All release stages deployment completed`;
        const partialMessage: string = `One or more release stage(s) partially succeeded`;
        const failedMessage: string = `One or more release stage(s) deployment failed`;

        debug(releaseProgress);

        switch (releaseProgress.status) {

            case ReleaseStatus.Succeeded: {

                this.consoleLogger.log(succeededMessage);

                break;

            } case ReleaseStatus.PartiallySucceeded: {

                setResult(TaskResult.SucceededWithIssues, partialMessage);

                break;

            } case ReleaseStatus.Failed: {

                throw new Error(failedMessage);

            }

        }

    }

    public async displayReleaseProgress(releaseProgress: IReleaseProgress): Promise<void> {

        const debug = this.debugLogger.extend(this.displayReleaseProgress.name);

        const table: Table = new Table({

            head: [

                "Project",
                "Release",
                "Stage",
                "Approval",
                "Status",
    
            ],

        });

        for (const stage of releaseProgress.stages) {

            const stageResult: any[] = [

                releaseProgress.project ?? "-",
                releaseProgress.name ? `${releaseProgress.name} (${releaseProgress.id})` : "-",
                stage.name ? stage.name : "-",
                stage.approval.status ? ApprovalStatus[stage.approval.status] : "-",
                stage.status ? EnvironmentStatus[stage.status] : "-",

            ];

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

                const table: Table = new Table({

                    head: [

                        "Agent",
                        "Task",
                        "Status",
                        "Duration",

                    ],

                });

                for (const task of job.tasks!) {

                    table.push([

                        task.agentName ? task.agentName : "-",
                        task.name ? task.name : "-",
                        task.status ? TaskStatus[task.status] : "-",
                        task.startTime && task.finishTime
                            ? Moment.duration(new Date(task.startTime).getTime() - new Date (task.finishTime).getTime()).humanize() : "-",

                    ]);

                }

                this.consoleLogger.log(table.toString());

            }

        }

    }

}
