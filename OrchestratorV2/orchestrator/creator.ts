import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { ReleaseDefinition, Release, Artifact } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IParameters, ReleaseType } from "../interfaces/task/parameters";
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
import { ISettings } from "../interfaces/common/settings";
import { DeploymentType } from "../interfaces/common/deploymenttype";

export class Creator implements ICreator {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    private coreHelper: ICoreHelper;
    private buildHelper: IBuildHelper;
    private releaseHelper: IReleaseHelper;

    constructor(coreHelper: ICoreHelper, buildHelper: IBuildHelper, releaseHelper: IReleaseHelper, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.coreHelper = coreHelper;
        this.buildHelper = buildHelper;
        this.releaseHelper = releaseHelper;

    }

    public async createJob(parameters: IParameters, details: IDetails): Promise<IReleaseJob> {

        const debug = this.debugLogger.extend(this.createJob.name);

        const targetProject: TeamProject = await this.coreHelper.getProject(parameters.projectId);
        const targetDefinition: ReleaseDefinition = await this.releaseHelper.getDefinition(targetProject.name!, Number(parameters.definitionId));

        this.consoleLogger.log(`Starting <${targetProject.name}> project <${targetDefinition.name}> release pipeline deployment`);

        const targetRelease: Release = await this.createRelease(targetProject, targetDefinition, parameters, details);
        const targetStages: string[] = await this.releaseHelper.getReleaseStages(targetRelease, parameters.stages);

        const releaseType: DeploymentType = await this.releaseHelper.getReleaseType(targetRelease);

        const settings: ISettings = {

            sleep: 5000,
            approvalRetry: 60,
            approvalSleep: 60000

        }

        const releaseJob: IReleaseJob = {

            project: targetProject,
            definition: targetDefinition,
            release: targetRelease,
            stages: targetStages,
            type: releaseType,
            settings: settings,

        };

        return releaseJob;

    }

    private async createRelease(project: TeamProject, definition: ReleaseDefinition, parameters: IParameters, details: IDetails): Promise<Release> {

        const debug = this.debugLogger.extend(this.createRelease.name);

        let release: Release;

        switch (parameters.releaseType) {

            case ReleaseType.New: {

                this.consoleLogger.log(`Creating new <${definition.name}> (${definition.id}) release pipeline release`);

                const artifactFilter: IArtifactFilter[] = await this.createArtifactFilter(project, definition, parameters.artifactTag, parameters.sourceBranch);

                release = await this.releaseHelper.createRelease(project.name!, definition, details, parameters.stages, artifactFilter);

                break;

            } case ReleaseType.Latest: {

                this.consoleLogger.log(`Targeting latest <${definition.name}> (${definition.id}) release pipeline release`);

                const releaseFilter: IReleaseFilter = await this.createReleaseFilter(project, definition, parameters.releaseTag, parameters.artifactTag, parameters.sourceBranch);

                release = await this.releaseHelper.findRelease(project.name!, definition.id!, parameters.stages, releaseFilter);

                break;

            } case ReleaseType.Specific: {

                this.consoleLogger.log(`Targeting specific <${definition.name}> (${definition.id}) release pipeline release`);

                release = await this.releaseHelper.getRelease(project.name!, Number(parameters.releaseId), parameters.stages);

                break;

            } default: {

                throw new Error(`Release type <${parameters.releaseType}> not supported`);

            }

        }

        return release;

    }

    private async createReleaseFilter(project: TeamProject, definition: ReleaseDefinition, releaseTag?: string[], artifactTag?: string[], sourceBranch?: string): Promise<IReleaseFilter> {

        const debug = this.debugLogger.extend(this.createReleaseFilter.name);

        const releaseFilter: IReleaseFilter = {};

        // Get primary definition build artifact
        const primaryBuildArtifact: Artifact = definition.artifacts!.filter((i) => i.isPrimary === true && i.type === "Build")[0];

        // Add release tag filter
        if (releaseTag && releaseTag.length >= 1) {

            this.consoleLogger.log(`Using <${releaseTag}> release tag(s) filter`);

            releaseFilter.tag = releaseTag;

        }

        if (primaryBuildArtifact) {

            // Add artifact tag filter
            if (artifactTag && artifactTag.length >= 1) {

                this.consoleLogger.log(`Using <${artifactTag}> artifact tag(s) filter`);

                // Get build matching artifact tag
                const targetArtifactBuild: Build = await this.buildHelper.findBuild(project.name!, Number(primaryBuildArtifact.definitionReference!.definition.id), artifactTag);

                releaseFilter.artifactVersion = String(targetArtifactBuild.id);

            }

            // Add source branch filter
            if (sourceBranch) {

                this.consoleLogger.log(`Using <${sourceBranch}> artifact branch filter`);

                releaseFilter.sourceBranch = sourceBranch;

            }

        }

        debug(releaseFilter);

        return releaseFilter;

    }

    private async createArtifactFilter(project: TeamProject, definition: ReleaseDefinition, artifactTag?: string[], sourceBranch?: string): Promise<IArtifactFilter[]> {

        const debug = this.debugLogger.extend(this.createArtifactFilter.name);

        let artifactFilter: IArtifactFilter[] = [];

        // Get primary definition build artifact
        const primaryBuildArtifact: Artifact = definition.artifacts!.filter((i) => i.isPrimary === true && i.type === "Build")[0];

        if (primaryBuildArtifact) {

            let artifactVersion;

            // Get build matching artifact tag
            if (artifactTag && artifactTag.length >= 1) {

                this.consoleLogger.log(`Using <${artifactTag}> artifact tag(s) filter`);

                const targetArtifactBuild: Build = await this.buildHelper.findBuild(project.name!, Number(primaryBuildArtifact.definitionReference!.definition.id), artifactTag);

                artifactVersion = String(targetArtifactBuild.id);

            }

            // Confirm source branch filter
            if (sourceBranch) {

                this.consoleLogger.log(`Using <${sourceBranch}> artifact branch filter`);

            }

            artifactFilter = await this.releaseHelper.getArtifacts(project.name!, definition.id!, primaryBuildArtifact.sourceId!, artifactVersion, sourceBranch);

        }

        debug(artifactFilter);

        return artifactFilter;

    }

}
