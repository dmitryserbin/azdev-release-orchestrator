/* eslint-disable @typescript-eslint/no-explicit-any */

import Table from "cli-table";

import { String } from "typescript-string-operations";

import { IDebug } from "../../loggers/idebug";
import { IProgressReporter } from "./iprogressreporter";
import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { ILogger } from "../../loggers/ilogger";
import { IFilters } from "../../helpers/taskhelper/ifilters";
import { IRun } from "../runcreator/irun";

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

        // // Highlight target stages in the release stages
        // const releaseStages: (string | undefined)[] = release.environments!.map(
        //     (stage) => {

        //         const targetStage: boolean = targetStages.includes(stage.name!);

        //         return (targetStage ? `${stage.name}*` : stage.name);

        //     });

        const releaseStages: string[] = run.stages; // TBU

        const releaseDate: Date | undefined = run.build.queueTime ?
            new Date(run.build.queueTime!) : undefined;

        table.push([

            run.build.id,
            run.build.buildNumber,
            releaseStages.length ? String.Join("|", releaseStages) : "-",
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

    public logFilters(filters: IFilters): void {

        const table: Table = this.newTable([

            "Source branch",
            "Pipeline resource",
            "Repository resources",
            "Stage status",

        ]);

        const pipelineResources: string[] = Object.keys(filters.pipelineResources).map(
            (i) => `${i}|${filters.pipelineResources[i]}`);

        const repositoryResources: string[] = Object.keys(filters.repositoryResources).map(
            (i) => `${i}|${filters.repositoryResources[i]}`);

        const result: any[] = [

            filters.sourceBranch ? filters.sourceBranch : "-",
            pipelineResources.length ? String.Join("\n", pipelineResources) : "-",
            repositoryResources.length ? String.Join("\n", repositoryResources) : "-",
            filters.stageStatuses.length ? String.Join("|", filters.stageStatuses) : "-",

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
