/* eslint-disable @typescript-eslint/no-explicit-any */

import Table from "cli-table";

import { String } from "typescript-string-operations";

import { IDebug } from "../../loggers/idebug";
import { IProgressReporter } from "./iprogressreporter";
import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { ILogger } from "../../loggers/ilogger";
import { IFilters } from "../../helpers/taskhelper/ifilters";

export class ProgressReporter implements IProgressReporter {

    private logger: ILogger;
    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

    }

    public logParameters(parameters: IBuildParameters): void {

        const table: Table = this.newTable([

            "Name",
            "Value",

        ]);

        for (const parameter of Object.keys(parameters)) {

            const maskedValue = this.maskString(parameters[parameter]);

            const result: any[] = [

                parameter,
                maskedValue,
    
            ];

            table.push(result);

        }

        this.logger.log(table.toString());

    }

    public logFilters(filters: IFilters): void {

        const table: Table = this.newTable([

            "Source branch",
            "Release tag",
            "Artifact version",
            "Artifact tag",
            "Stage status",

        ]);

        const result: any[] = [

            filters.sourceBranch ? filters.sourceBranch : "-",
            filters.releaseTags.length ? String.Join("|", filters.releaseTags) : "-",
            filters.artifactVersion ? filters.artifactVersion : "-",
            filters.artifactTags.length ? String.Join("|", filters.artifactTags) : "-",
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
