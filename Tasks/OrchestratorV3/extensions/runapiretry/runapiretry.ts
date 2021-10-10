/* eslint-disable @typescript-eslint/no-explicit-any */

import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IApiClient } from "../../common/iapiclient";
import { IBuildParameters } from "../../helpers/taskhelper/ibuildparameters";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRepositoryFilter } from "../../workers/filtercreator/irepositoryfilter";
import { IRunApiRetry } from "./irunapiretry";

export class RunApiRetry implements IRunApiRetry {

    private debugLogger: IDebug;

    private apiClient: IApiClient;

    constructor(apiClient: IApiClient, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.apiClient = apiClient;

    }

    public async queueRun(definition: BuildDefinition, request: unknown): Promise<unknown> {

        const debug = this.debugLogger.extend(this.queueRun.name);

        const run: unknown = await this.apiClient.post(`${definition.project?.name}/_apis/pipelines/${definition.id}/runs`, `5.1-preview.1`, request);

        if (!run) {

            throw new Error(`Unable to create <${definition.name}> (${definition.id}) definition run`);

        }

        return run;

    }

    public async getRunDetails(build: Build): Promise<unknown> {

        const debug = this.debugLogger.extend(this.getRunDetails.name);

        const body: unknown = {

            contributionIds: [
                `ms.vss-build-web.run-details-data-provider`,
            ],
            dataProviderContext: {
                properties: {
                    buildId: `${build.id}`,
                    sourcePage: {
                        routeId: `ms.vss-build-web.ci-results-hub-route`,
                        routeValues: {
                            project: build.project?.name,
                        }
                    }
                },
            },

        };

        const result: any = await this.apiClient.post(`_apis/Contribution/HierarchyQuery/project/${build.project?.id}`, `5.0-preview.1`, body);

        if (result.dataProviderExceptions) {

            debug(result);

            throw new Error(`Unable to retrieve <${build.buildNumber}> (${build.id}) run details`);

        }

        const runDetails: unknown = result.dataProviders[`ms.vss-build-web.run-details-data-provider`];

        return runDetails;

    }

    public async getRunParameters(definition: BuildDefinition, repository?: IRepositoryFilter, parameters?: IBuildParameters): Promise<unknown> {

        const debug = this.debugLogger.extend(this.getRunParameters.name);

        const body: unknown = {

            contributionIds: [
                `ms.vss-build-web.pipeline-run-parameters-data-provider`,
            ],
            dataProviderContext: {
                properties: {
                    onlyFetchTemplateParameters: false,
                    pipelineId: definition.id,
                    sourceBranch: repository ? repository.refName : ``,
                    sourceVersion: repository ? repository.version : ``,
                    sourcePage: {
                        routeId: `ms.vss-build-web.pipeline-details-route`,
                        routeValues: {
                            project: definition.project?.name,
                        },
                    },
                    templateParameters: (parameters && Object.keys(parameters).length) ? parameters : {},
                },
            },

        };

        const result: any = await this.apiClient.post(`_apis/Contribution/HierarchyQuery/project/${definition.project?.id}`, `5.0-preview.1`, body);

        if (result.dataProviderExceptions) {

            debug(result);

            throw new Error(`Unable to retrieve <${definition.name}> (${definition.id}) run parameters`);

        }

        const runParameters: unknown = result.dataProviders[`ms.vss-build-web.pipeline-run-parameters-data-provider`];

        return runParameters;

    }

}
