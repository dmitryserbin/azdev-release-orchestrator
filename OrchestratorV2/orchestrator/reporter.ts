import Table from "cli-table";

import { setResult, TaskResult } from "azure-pipelines-task-lib";
import { ApprovalStatus, EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

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

    public async validate(releaseProgress: IReleaseProgress): Promise<void> {

        const debug = this.debugLogger.extend(this.validate.name);

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

    public async display(releaseProgress: IReleaseProgress): Promise<void> {

        const debug = this.debugLogger.extend(this.display.name);

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

}