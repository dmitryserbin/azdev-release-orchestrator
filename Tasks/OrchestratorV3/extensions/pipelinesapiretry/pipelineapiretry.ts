/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IApiClient } from "../../common/iapiclient";
import { Retryable } from "../../common/retry";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IPipelinesApiRetry } from "./ipipelineapiretry";

export class PipelinesApiRetry implements IPipelinesApiRetry {

    private debugLogger: IDebug;

    private apiClient: IApiClient;

    constructor(apiClient: IApiClient, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.apiClient = apiClient;

    }

    @Retryable()
    public async queueRun(definition: BuildDefinition, request: unknown): Promise<unknown> {

        const run: unknown = await this.apiClient.post(`${definition.project?.name}/_apis/pipelines/${definition.id}/runs`, `5.1-preview.1`, request);

        if (!run) {

            throw new Error(`Unable to create <${definition.name}> (${definition.id}) definition run`);

        }

        return run;

    }

    // Do not use REST API retry for approvals
    // Rely on approval retry mechanism instead
    public async updateApproval(build: Build, request: unknown): Promise<unknown> {

        const approval: any = await this.apiClient.patch(`${build.project?.name}/_apis/pipelines/approvals`, `5.1-preview.1`, [ request ]);

        if (!Array.isArray(approval.value) && approval.value.length <= 0) {

            throw new Error(`Unable to update <${build.buildNumber}> (${build.id}) build approval`);

        }

        return approval.value[0];

    }

}
