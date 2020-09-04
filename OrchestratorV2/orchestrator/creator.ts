import { ReleaseDefinition, Release, Artifact, EnvironmentStatus, ReleaseStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { String } from "typescript-string-operations";

import { IParameters } from "../interfaces/task/parameters";
import { ReleaseType } from "../interfaces/common/releasetype";
import { IDetails } from "../interfaces/task/details";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { ICreator } from "../interfaces/orchestrator/creator";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IReleaseJob } from "../interfaces/common/releasejob";
import { IReleaseFilter } from "../interfaces/common/releasefilter";
import { IArtifactFilter } from "../interfaces/common/artifactfilter";
import { DeploymentType } from "../interfaces/common/deploymenttype";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { IFilters } from "../interfaces/task/filters";

export class Creator implements ICreator {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    private coreHelper: ICoreHelper;
    private buildHelper: IBuildHelper;
    private releaseHelper: IReleaseHelper;
    private progressReporter: IReporter;

    constructor(coreHelper: ICoreHelper, buildHelper: IBuildHelper, releaseHelper: IReleaseHelper, progressReporter: IReporter, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.coreHelper = coreHelper;
        this.buildHelper = buildHelper;
        this.releaseHelper = releaseHelper;
        this.progressReporter = progressReporter;

    }

    public async createJob(parameters: IParameters, details: IDetails): Promise<IReleaseJob> {

        const debug = this.debugLogger.extend(this.createJob.name);

        const targetProject: TeamProject = await this.coreHelper.getProject(parameters.projectName);
        const targetDefinition: ReleaseDefinition = await this.releaseHelper.getDefinition(targetProject.name!, parameters.definitionName);

        this.consoleLogger.log(`Starting <${targetProject.name}> project <${targetDefinition.name}> release pipeline deployment`);

        const targetRelease: Release = await this.createRelease(targetProject, targetDefinition, parameters, details);
        const targetStages: string[] = await this.releaseHelper.getReleaseStages(targetRelease, parameters.stages);

        const releaseType: DeploymentType = await this.releaseHelper.getReleaseType(targetRelease);

        const releaseJob: IReleaseJob = {

            project: targetProject,
            definition: targetDefinition,
            release: targetRelease,
            stages: targetStages,
            type: releaseType,
            settings: parameters.settings,

        };

        debug(`Release <${targetRelease.name}> (<${String.Join("|", targetStages)}>) job cleated`);

        return releaseJob;

    }

    private async createRelease(project: TeamProject, definition: ReleaseDefinition, parameters: IParameters, details: IDetails): Promise<Release> {

        const debug = this.debugLogger.extend(this.createRelease.name);

        let release: Release;

        switch (parameters.releaseType) {

            case ReleaseType.New: {

                this.consoleLogger.log(`Creating new <${definition.name}> (${definition.id}) release pipeline release`);

                this.consoleLogger.log(
                    this.progressReporter.getFilters(parameters.filters)
                );

                const artifactFilter: IArtifactFilter[] = await this.createArtifactFilter(project, definition, parameters.filters);

                if (parameters.variables && parameters.variables.length > 0) {

                    this.consoleLogger.log(`Overridding <${parameters.variables.length}> release pipeline <${definition.name}> variable(s)`);

                    this.consoleLogger.log(
                        this.progressReporter.getVariables(parameters.variables)
                    );

                }

                release = await this.releaseHelper.createRelease(project.name!, definition, details, parameters.stages, parameters.variables, artifactFilter);

                break;

            } case ReleaseType.Latest: {

                this.consoleLogger.log(`Targeting latest <${definition.name}> (${definition.id}) release pipeline release`);

                this.consoleLogger.log(
                    this.progressReporter.getFilters(parameters.filters)
                );

                const releaseFilter: IReleaseFilter = await this.createReleaseFilter(project, definition, parameters.stages, parameters.filters);

                release = await this.releaseHelper.getLastRelease(project.name!, definition.id!, parameters.stages, releaseFilter);

                break;

            } case ReleaseType.Specific: {

                this.consoleLogger.log(`Targeting specific <${definition.name}> (${definition.id}) release pipeline release`);

                release = await this.releaseHelper.getRelease(project.name!, definition.id!, parameters.releaseName, parameters.stages);

                break;

            } default: {

                throw new Error(`Release type <${parameters.releaseType}> not supported`);

            }

        }

        debug(`Release <${release.name}> type <${ReleaseType[parameters.releaseType]}> created`);

        return release;

    }

    private async createReleaseFilter(project: TeamProject, definition: ReleaseDefinition, stages: string[], filters: IFilters): Promise<IReleaseFilter> {

        const debug = this.debugLogger.extend(this.createReleaseFilter.name);

        const releaseFilter: IReleaseFilter = {

            artifactVersion: "",
            sourceBranch: "",
            tags: [],
            stages,
            stageStatuses: [],
            releaseStatus: ReleaseStatus.Active,

        };

        // Add release tag filter
        if (filters.releaseTags && filters.releaseTags.length > 0) {

            debug(`Using <${String.Join("|", filters.releaseTags)}> release tag filter`);

            releaseFilter.tags = filters.releaseTags;

        }

        // Get primary build artifact
        const primaryBuildArtifact: Artifact | null = await this.releaseHelper.getDefinitionPrimaryArtifact(definition, "Build");

        // Add release artifact filter
        if (primaryBuildArtifact) {

            // Add artifact tag filter
            if (filters.artifactTags && filters.artifactTags.length > 0) {

                debug(`Using <${String.Join("|", filters.artifactTags)}> artifact tag filter`);

                // Get build matching artifact tag
                const targetArtifactBuild: Build = await this.buildHelper.findBuild(project.name!, Number(primaryBuildArtifact.definitionReference!.definition.id), filters.artifactTags);

                releaseFilter.artifactVersion = targetArtifactBuild.id!.toString();

            }

            // Add source branch filter
            if (filters.artifactBranch) {

                debug(`Using <${filters.artifactBranch}> artifact branch filter`);

                releaseFilter.sourceBranch = filters.artifactBranch;

            }

        }

        // Add stage status filter
        if (filters.stageStatuses && filters.stageStatuses.length > 0) {

            debug(`Using <${String.Join("|", filters.stageStatuses)}> release stage status filter`);

            for (const status of filters.stageStatuses) {

                switch (status) {

                    case "Succeeded": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.Succeeded);

                        break;

                    } case "PartiallySucceeded": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.PartiallySucceeded);

                        break;

                    } case "NotStarted": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.NotStarted);

                        break;

                    } case "Rejected": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.Rejected);

                        break;

                    } case "Canceled": {

                        releaseFilter.stageStatuses.push(EnvironmentStatus.Canceled);

                        break;

                    } default: {

                        throw new Error(`Stage status filter <${status}> not supported`);

                    }

                }

            }

        }

        debug(releaseFilter);

        return releaseFilter;

    }

    private async createArtifactFilter(project: TeamProject, definition: ReleaseDefinition, filters: IFilters): Promise<IArtifactFilter[]> {

        const debug = this.debugLogger.extend(this.createArtifactFilter.name);

        let artifactFilter: IArtifactFilter[] = [];

        // Get primary build artifact
        const primaryBuildArtifact: Artifact | null = await this.releaseHelper.getDefinitionPrimaryArtifact(definition, "Build");

        if (primaryBuildArtifact) {

            let artifactVersion;

            // Get build matching artifact tag
            if (filters.artifactTags && filters.artifactTags.length > 0) {

                debug(`Using <${String.Join("|", filters.artifactTags)}> artifact tag(s) filter`);

                const targetArtifactBuild: Build = await this.buildHelper.findBuild(project.name!, Number(primaryBuildArtifact.definitionReference!.definition.id), filters.artifactTags);

                artifactVersion = targetArtifactBuild.id!.toString();

            }

            // Confirm source branch filter
            if (filters.artifactBranch) {

                debug(`Using <${filters.artifactBranch}> artifact branch filter`);

            }

            artifactFilter = await this.releaseHelper.getArtifacts(project.name!, definition.id!, primaryBuildArtifact.sourceId!, artifactVersion, filters.artifactBranch);

        }

        debug(artifactFilter);

        return artifactFilter;

    }

}
