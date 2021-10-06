import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IFiltrator } from "../interfaces/orchestrator/filtrator";

export class Filtrator implements IFiltrator {

    private debugLogger: IDebugLogger;

    constructor(debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

    }

}
