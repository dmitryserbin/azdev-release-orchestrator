import { String } from "typescript-string-operations";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ReleaseDefinition, Artifact, EnvironmentStatus, ReleaseStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";

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

            const artifactProjectName: string = project.name!;
            const artifactDefinitionId: number = definition.id!;
            const artifactSourceId: string = primaryBuildArtifact.sourceId!;

            let artifactVersion: string | undefined;
            let artifactBranch: string | undefined;

            // Get build artifact version
            if (filters.artifactVersion || filters.artifactTags.length) {

                const buildArtifact: Build = await this.getArtifactBuild(primaryBuildArtifact, filters.artifactVersion, filters.artifactTags);

                artifactVersion = buildArtifact.id!.toString();

            }

            // Get artifact branch filter
            if (filters.artifactBranch) {

                debug(`Using <${filters.artifactBranch}> artifact branch filter`);

                artifactBranch = filters.artifactBranch;

            }

            artifactFilter = await this.releaseHelper.getArtifacts(artifactProjectName, artifactDefinitionId, artifactSourceId, artifactVersion, artifactBranch);

        }

        debug(artifactFilter);

        return artifactFilter;

    }

    public async createReleaseFilter(definition: ReleaseDefinition, stages: string[], filters: IFilters): Promise<IReleaseFilter> {

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

                const buildArtifact: Build = await this.getArtifactBuild(primaryBuildArtifact, filters.artifactVersion, filters.artifactTags);

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

    private async getArtifactBuild(buildArtifact: Artifact, version: string, tags: string[]): Promise<Build> {

        const debug = this.debugLogger.extend(this.getArtifactBuild.name);

        if (version) {

            debug(`Using <${version}> artifact version filter`);

        }

        if (tags.length) {

            debug(`Using <${String.Join("|", tags)}> artifact tag filter`);

        }

        const projectName: string = buildArtifact.definitionReference!.project.name!;
        const buildDefinitionName: string = buildArtifact.definitionReference!.definition.name!;
        const buildDefinitionId: number = Number(buildArtifact.definitionReference!.definition.id!);

        const build: Build = await this.buildHelper.findBuild(projectName, buildDefinitionName, buildDefinitionId, version, tags, 100);

        return build;

    }

}
