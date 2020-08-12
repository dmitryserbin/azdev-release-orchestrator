import Debug from "debug";

import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";

export class ReleaseHelper implements IReleaseHelper {

    private debugLogger: Debug.Debugger;

    private releaseApi: IReleaseApi;

    constructor(releaseApi: IReleaseApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.releaseApi = releaseApi;

    }

    public async getDefinition(projectName: string, definitionId: number): Promise<ReleaseDefinition> {

        const debug = this.debugLogger.extend(this.getDefinition.name);

        const targetDefinition: ReleaseDefinition = await this.releaseApi.getReleaseDefinition(projectName, definitionId);

        if (!targetDefinition) {

            throw new Error(`Definition <${definitionId}> not found`);

        }

        debug(targetDefinition);

        return targetDefinition;

    }

}
