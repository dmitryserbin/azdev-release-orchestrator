/* eslint-disable @typescript-eslint/no-explicit-any */

import Table from "cli-table";
import Moment from "moment";

import { TaskResult, TimelineRecordState } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IDebug } from "../../loggers/idebug";
import { IProgressReporter } from "./iprogressreporter";
import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { ILogger } from "../../loggers/ilogger";
import { IFilters } from "../../helpers/taskhelper/ifilters";
import { IRun } from "../runcreator/irun";
import { Strategy } from "../../helpers/taskhelper/strategy";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { RunStatus } from "../../orchestrator/runstatus";
import { IBuildStage } from "../progressmonitor/ibuildstage";

export class ProgressReporter implements IProgressReporter {

    private logger: ILogger;
    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

    }

    public logRun(run: IRun): void {

        const debug = this.debugLogger.extend(this.logRun.name);

        const table: Table = this.newTable([

            "ID",
            "Name",
            "Stages",
            "Created By",
            "Created On",

        ]);

        // Highlight target stages
        const stages: string[] = run.stages.map(
            (stage) => stage.target === true ? `${stage.name}*` : stage.name);

        const releaseDate: Date | null = run.build.queueTime ?
            new Date(run.build.queueTime!) : null;

        table.push([

            run.build.id ? run.build.id.toString() : "-",
            run.build.buildNumber ? run.build.buildNumber : "",
            stages.length ? stages?.join("|") : "-",
            run.build.requestedFor?.displayName ? run.build.requestedFor.displayName : "-",
            releaseDate ? `${releaseDate.toLocaleDateString()} at ${releaseDate.toLocaleTimeString()}` : "-",

        ]);

        const urls: unknown = {
            project: run.project?.url ? run.project?.url : "-",
            definition: run.definition.url ? run.definition.url : "-",
            build: run.build.url ? run.build.url : "-",
            timeline: (run.build.url && run.build.orchestrationPlan?.planId) ? `${run.build.url}/timeline/${run.build.orchestrationPlan.planId}` : "-",
            logs: run.build.logs?.url ? run.build.logs.url : "-",

        };

        debug(urls);

        this.logger.log(table.toString());

    }

    public logParameters(parameters: IBuildParameters): void {

        const table: Table = this.newTable([

            "Name",
            "Value",

        ]);

        for (const parameter of Object.keys(parameters)) {

            let value: any;

            if (typeof parameters[parameter] === "string") {

                value = this.maskString(parameters[parameter] as string);

            } else {

                value = parameters[parameter];

            }

            const result: any[] = [

                parameter,
                value,

            ];

            table.push(result);

        }

        this.logger.log(table.toString());

    }

    public logFilters(filters: IFilters, strategy: Strategy): void {

        const columns: string[] = [];

        const result: any[] = [];

        switch (strategy) {

            case Strategy.New: {

                columns.push("Branch name");
                columns.push("Pipeline resource");
                columns.push("Repository resources");

                const pipelineResources: string[] = Object.keys(filters.pipelineResources).map(
                    (i) => `${i}|${filters.pipelineResources[i]}`);

                const repositoryResources: string[] = Object.keys(filters.repositoryResources).map(
                    (i) => `${i}|${filters.repositoryResources[i]}`);

                result.push(filters.branchName ? filters.branchName : "-");
                result.push(pipelineResources.length ? pipelineResources?.join("\n") : "-");
                result.push(repositoryResources.length ? repositoryResources?.join("\n") : "-");

                break;

            } case Strategy.Latest: {

                columns.push("Branch name");
                columns.push("Build result");
                columns.push("Build tags");

                result.push(filters.branchName ? filters.branchName : "-");
                result.push(filters.buildResult ? filters.buildResult : "-");
                result.push(filters.buildTags.length ? filters.buildTags?.join("|") : "-");

                break;

            } default: {

                throw new Error(`Strategy <${Strategy[strategy]}> not implemented`);

            }

        }

        const table: Table = this.newTable(columns);

        table.push(result);

        this.logger.log(table.toString());

    }

    public logStageProgress(stage: IBuildStage): void {

        const table: Table = this.newTable([

            "Agent",
            "Job",
            "Task",
            "Result",
            "Duration",

        ]);

        for (const job of stage.jobs) {

            for (const task of job.tasks) {

                const duration: string | null = (task.startTime && task.finishTime) ?
                    Moment.duration(new Date(task.startTime).getTime() - new Date(task.finishTime).getTime()).humanize() : null;

                const result: any[] = [

                    job.workerName ? job.workerName : "-",
                    job.name,
                    task.name,
                    task.result !== null ? TaskResult[task.result] : "-",
                    duration ? duration : "-",

                ];

                table.push(result);

            }

        }

        this.logger.log(table.toString());

    }

    public logStagesProgress(stages: IBuildStage[]): void {

        const table: Table = this.newTable([

            "Stage",
            "Jobs",
            "Tasks",
            "Attempt",
            "Checkpoint",
            "Result",
            "Duration",

        ]);

        for (const stage of stages) {

            const tasksCount: number = stage.jobs.map(
                (job) => job.tasks.length).reduce((a, b) => a + b, 0);

            const duration: string | null = (stage.startTime && stage.finishTime) ?
                Moment.duration(new Date(stage.startTime).getTime() - new Date(stage.finishTime).getTime()).humanize() : null;

            const result: any[] = [

                stage.name ? stage.name : "-",
                stage.jobs.length ? stage.jobs.length : "-",
                tasksCount ? tasksCount : "-",
                stage.attempt.stage ? stage.attempt.stage : "-",
                stage.checkpoint ? TimelineRecordState[stage.checkpoint.state] : "-",
                stage.result !== null ? TaskResult[stage.result] : "-",
                duration ? duration : "-",

            ];

            table.push(result);

        }

        this.logger.log(table.toString());

    }

    public logRunProgress(runProgress: IRunProgress): void {

        const table: Table = this.newTable([

            "ID",
            "Build",
            "Stages",
            "Result",
            "Summary",

        ]);

        const stages: string[] = runProgress.stages.map(
            (stage) => stage.name);

        const result: any[] = [

            runProgress.id ? runProgress.id : "-",
            runProgress.name ? runProgress.name : "-",
            stages.length ? stages?.join("|") : "-",
            runProgress.status ? RunStatus[runProgress.status] : "-",
            runProgress.url ? runProgress.url : "-",

        ];

        table.push(result);

        this.logger.log(table.toString());

    }

    private newTable(headers: string[], widths: number[] = []): Table {

        const options: any = {

            head: headers,
            widths,

        };

        const table: Table = new Table(options);

        return table;

    }

    private maskString(input: string, character: string = "*", leading: number = 1, trailing: number = 1): string {

        let totalLenght: number = input.length;
        let maskedLength: number;
        let maskedBuffer: string = "";

        maskedBuffer = maskedBuffer.concat(input.substring(0, leading));

        if (totalLenght > trailing + leading) {

            maskedLength = totalLenght - (trailing + leading);

            for (let i = 0; i < maskedLength; i++) {

                maskedBuffer += character;

            }

        } else {

            maskedLength = 0;

            totalLenght = trailing + leading;

        }

        maskedBuffer = maskedBuffer.concat(input.substring(leading + maskedLength, totalLenght));

        return maskedBuffer.toString();

    }

}
