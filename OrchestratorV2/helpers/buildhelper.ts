import Debug from "debug";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IBuildApi } from "azure-devops-node-api/BuildApi";

export class BuildHelper implements IBuildHelper {

    private debugLogger: Debug.Debugger;

    private buildApi: IBuildApi;

    constructor(buildApi: IBuildApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.buildApi = buildApi;

    }

}
