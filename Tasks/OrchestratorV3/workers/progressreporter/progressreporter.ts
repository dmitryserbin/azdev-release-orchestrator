/* eslint-disable @typescript-eslint/no-explicit-any */

import Table from "cli-table";

import { String } from "typescript-string-operations";

import { IDebug } from "../../loggers/idebug";
import { IProgressReporter } from "./iprogressreporter";
import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { ILogger } from "../../loggers/ilogger";
import { IFilters } from "../../helpers/taskhelper/ifilters";
import { IRun } from "../runcreator/irun";
import { ReleaseType } from "../../helpers/taskhelper/releasetype";

export class ProgressReporter implements IProgressReporter {

    private logger: ILogger;
    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

    }

    public logRun(run: IRun): void {

        const table: Table = this.newTable([

            "ID",
            "Name",
            "Stages",
            "Created By",
            "Created On",

        ]);

        // Highlight target stages
        const buildStages = Object.keys(run.stages).map(
            (stage) => run.stages[stage] === true ? `${stage}*` : stage);

        const releaseDate: Date | undefined = run.build.queueTime ?
            new Date(run.build.queueTime!) : undefined;

        table.push([

            run.build.id,
            run.build.buildNumber,
            buildStages.length ? String.Join("|", buildStages) : "-",
            run.build.requestedBy ? run.build.requestedBy.displayName : "-",
            releaseDate ? `${releaseDate.toLocaleDateString()} at ${releaseDate.toLocaleTimeString()}` : "-",

        ]);

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

    public logFilters(filters: IFilters, type: ReleaseType): void {

        const columns: string[] = [];

        const result: any[] = [];

        switch (type) {

            case ReleaseType.New: {

                columns.push("Branch name");
                columns.push("Pipeline resource");
                columns.push("Repository resources");

                const pipelineResources: string[] = Object.keys(filters.pipelineResources).map(
                    (i) => `${i}|${filters.pipelineResources[i]}`);
        
                const repositoryResources: string[] = Object.keys(filters.repositoryResources).map(
                    (i) => `${i}|${filters.repositoryResources[i]}`);

                result.push(filters.branchName ? filters.branchName : "-");
                result.push(pipelineResources.length ? String.Join("\n", pipelineResources) : "-");
                result.push(repositoryResources.length ? String.Join("\n", repositoryResources) : "-");

                break;

            } case ReleaseType.Latest: {

                columns.push("Branch name");
                columns.push("Build result");
                columns.push("Build tags");

                result.push(filters.branchName ? filters.branchName : "-");
                result.push(filters.buildResult ? filters.buildResult : "-");
                result.push(filters.buildTags.length ? String.Join("|", filters.buildTags) : "-");

                break;

            } default: {

                throw new Error(`Type <${ReleaseType[type]}> not implemented`);

            }
        }

        const table: Table = this.newTable(columns);

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
