import { IDebug } from "../interfaces/loggers/debug";
import { ILogger } from "../interfaces/loggers/logger";
import { IFiltrator } from "../interfaces/orchestrator/filtrator";

export class Filtrator implements IFiltrator {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

}
