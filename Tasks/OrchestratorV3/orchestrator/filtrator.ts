import { BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IBuildFilter } from "../interfaces/common/ibuildfilter";
import { IDebug } from "../interfaces/loggers/idebug";
import { ILogger } from "../interfaces/loggers/ilogger";
import { IFiltrator } from "../interfaces/orchestrator/ifiltrator";

export class Filtrator implements IFiltrator {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public async createBuildFilter(): Promise<IBuildFilter> {

        const debug = this.debugLogger.extend(this.createBuildFilter.name);

        const buildFilter: IBuildFilter = {

            buildStatus: BuildStatus.Completed,

        };

        debug(buildFilter);

        return buildFilter;

    }

}
