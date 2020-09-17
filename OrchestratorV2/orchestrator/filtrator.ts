import { ReleaseDefinition, Artifact, EnvironmentStatus, ReleaseStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { String } from "typescript-string-operations";

import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IReleaseFilter } from "../interfaces/common/releasefilter";
import { IArtifactFilter } from "../interfaces/common/artifactfilter";
import { IFilters } from "../interfaces/task/filters";
import { IFiltrator } from "../interfaces/orchestrator/filtrator";

export class Filtrator implements IFiltrator {

    private debugLogger: IDebugLogger;

    private buildHelper: IBuildHelper;
    private releaseHelper: IReleaseHelper;

    constructor(buildHelper: IBuildHelper, releaseHelper: IReleaseHelper, debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

        this.buildHelper = buildHelper;
        this.releaseHelper = releaseHelper;

    }

    public async createArtifactFilter(project: TeamProject, definition: ReleaseDefinition, filters: IFilters): Promise<IArtifactFilter[]> {

        const debug = this.debugLogger.extend(this.createArtifactFilter.name);

        let artifactFilter: IArtifactFilter[] = [];

        const primaryBuildArtifact: Artifact | undefined = await this.releaseHelper.getDefinitionPrimaryArtifact(definition, "Build");

        if (primaryBuildArtifact) {

            const artifactSourceId: string = primaryBuildArtifact.sourceId!;

            let artifactVersion: string | undefined;
            let artifactBranch: string | undefined;

            // Get build artifact version
            if (filters.artifactVersion || filters.artifactTags.length) {

                if (filters.artifactVersion) {

                    debug(`Using <${filters.artifactVersion}> artifact version filter`);

                }

                if (filters.artifactTags.length) {

                    debug(`Using <${String.Join("|", filters.artifactTags)}> artifact tag filter`);

                }

                const buildDefinitionName: string = primaryBuildArtifact.definitionReference!.definition.name!;
                const buildDefinitionId: number = Number(primaryBuildArtifact.definitionReference!.definition.id!);

                const buildArtifact: Build = await this.buildHelper.findBuild(project.name!, buildDefinitionName, buildDefinitionId, filters.artifactVersion, filters.artifactTags, 100);

                artifactVersion = buildArtifact.id!.toString();

            }

            // Get artifact branch filter
            if (filters.artifactBranch) {

                debug(`Using <${filters.artifactBranch}> artifact branch filter`);

                artifactBranch = filters.artifactBranch;

            }

            artifactFilter = await this.releaseHelper.getArtifacts(project.name!, definition.id!, artifactSourceId, artifactVersion, artifactBranch);

        }

        debug(artifactFilter);

        return artifactFilter;

    }

    public async createReleaseFilter(project: TeamProject, definition: ReleaseDefinition, stages: string[], filters: IFilters): Promise<IReleaseFilter> {

        const debug = this.debugLogger.extend(this.createReleaseFilter.name);

        const releaseFilter: IReleaseFilter = {

            artifactVersionId: undefined,
            artifactBranch: "",
            tags: [],
            stages,
            stageStatuses: [],
            releaseStatus: ReleaseStatus.Active,

        };

        const primaryBuildArtifact: Artifact | undefined = await this.releaseHelper.getDefinitionPrimaryArtifact(definition, "Build");

        // Add artifact filter
        if (primaryBuildArtifact) {

            // Add build artifact version
            if (filters.artifactVersion || filters.artifactTags.length) {

                if (filters.artifactVersion) {

                    debug(`Using <${filters.artifactVersion}> artifact version filter`);

                }

                if (filters.artifactTags.length) {

                    debug(`Using <${String.Join("|", filters.artifactTags)}> artifact tag filter`);

                }

                const buildDefinitionName: string = primaryBuildArtifact.definitionReference!.definition.name!;
                const buildDefinitionId: number = Number(primaryBuildArtifact.definitionReference!.definition.id!);

                const buildArtifact: Build = await this.buildHelper.findBuild(project.name!, buildDefinitionName, buildDefinitionId, filters.artifactVersion, filters.artifactTags, 100);

                releaseFilter.artifactVersionId = buildArtifact.id!;

            }

            // Add artifact branch filter
            if (filters.artifactBranch) {

                debug(`Using <${filters.artifactBranch}> artifact branch filter`);

                releaseFilter.artifactBranch = filters.artifactBranch;

            }

        }

        // Add release tag filter
        if (filters.releaseTags.length) {

            debug(`Using <${String.Join("|", filters.releaseTags)}> release tag filter`);

            releaseFilter.tags = filters.releaseTags;

        }

        // Add stage status filter
        if (filters.stageStatuses.length) {

            debug(`Using <${String.Join("|", filters.stageStatuses)}> release stage status filter`);

            const supportedStatuses: string[] = [

                "succeeded",
                "partiallySucceeded",
                "notStarted",
                "rejected",
                "canceled",

            ];

            for (const status of filters.stageStatuses) {

                switch (status.toLowerCase()) {

                    case "succeeded": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.Succeeded);

                        break;

                    } case "partiallysucceeded": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.PartiallySucceeded);

                        break;

                    } case "notstarted": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.NotStarted);

                        break;

                    } case "rejected": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.Rejected);

                        break;

                    } case "canceled": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.Canceled);

                        break;

                    } default: {

                        throw new Error(`Stage status filter <${status}> not supported. Supported statuses: ${String.Join("|", supportedStatuses)}`);

                    }

                }

            }

        }

        debug(releaseFilter);

        return releaseFilter;

    }

}
