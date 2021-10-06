/* eslint-disable @typescript-eslint/no-explicit-any */

import Table from "cli-table";

import { IDebug } from "../interfaces/loggers/debug";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { IBuildParameters } from "../interfaces/common/buildparameters";
import { ILogger } from "../interfaces/loggers/logger";

export class Reporter implements IReporter {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public getParameters(parameters: IBuildParameters): string {

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

        return table.toString();

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
