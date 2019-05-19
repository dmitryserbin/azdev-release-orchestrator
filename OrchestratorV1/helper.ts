import Debug from "debug";

import * as ba from "azure-devops-node-api/BuildApi";
import * as ca from "azure-devops-node-api/CoreApi";
import * as bi from "azure-devops-node-api/interfaces/BuildInterfaces";
import * as ci from "azure-devops-node-api/interfaces/CoreInterfaces";
import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import * as ra from "azure-devops-node-api/ReleaseApi";

import { IHelper, IReleaseDetails, IReleaseFilter, IRetryOptions } from "./interfaces";

const logger = Debug("release-orchestrator:Helper");

export class Helper implements IHelper {

    private options: IRetryOptions;
    private coreApi: ca.ICoreApi;
    private releaseApi: ra.IReleaseApi;
    private buildApi: ba.IBuildApi;

    constructor(coreApi: ca.ICoreApi, releaseApi: ra.IReleaseApi, buildApi: ba.IBuildApi, options: IRetryOptions) {

        this.options = options;
        this.coreApi = coreApi;
        this.releaseApi = releaseApi;
        this.buildApi = buildApi;

    }

    public async getProject(projectId: string): Promise<ci.TeamProject> {

        const verbose = logger.extend("getProject");

        let retryAttempt: number = 0;
        let targetProject: ci.TeamProject | undefined;

        // Retry mechanism to address
        // Intermittent ECONNRESET errors
        while (retryAttempt < this.options.attempts) {

            try {

                retryAttempt++;

                targetProject = await this.coreApi.getProject(projectId);

                retryAttempt = this.options.timeout;

            } catch {

                console.log(`Retry retrieving target project..`);

                await this.delay(this.options.timeout);

            }

        }

        if (!targetProject) {

            throw new Error(`Project <${projectId}> not found`);

        }

        verbose(targetProject);

        return targetProject;

    }

    public async getDefinition(projectName: string, definitionId: number): Promise<ri.ReleaseDefinition> {

        const verbose = logger.extend("getDefinition");

        let retryAttempt: number = 0;
        let targetDefinition: ri.ReleaseDefinition | undefined;

        // Retry mechanism to address
        // Intermittent ECONNRESET errors
        while (retryAttempt < this.options.attempts) {

            try {

                retryAttempt++;

                targetDefinition = await this.releaseApi.getReleaseDefinition(projectName, definitionId);

                retryAttempt = this.options.timeout;

            } catch {

                console.log(`Retry retrieving release definition..`);

                await this.delay(this.options.timeout);

            }

        }

        if (!targetDefinition) {

            throw new Error(`Definition <${definitionId}> not found`);

        }

        verbose(targetDefinition);

        return targetDefinition;

    }

    public async findRelease(projectName: string, definitionId: number, stages: string[], filter: IReleaseFilter): Promise<ri.Release> {

        const verbose = logger.extend("findRelease");

        try {

            const availableReleases: ri.Release[] = await this.releaseApi.getReleases(
                projectName,
                definitionId,
                undefined,
                undefined,
                undefined,
                ri.ReleaseStatus.Active,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                ri.ReleaseExpands.Artifacts,
                undefined,
                undefined,
                filter.artifactVersion ? filter.artifactVersion : undefined,
                filter.sourceBranch ? filter.sourceBranch : undefined,
                undefined,
                (filter.tag && filter.tag.length) ? filter.tag : undefined);

            if (!availableReleases) {

                throw new Error(`No ${projectName} project ${definitionId} definition releases found`);

            }

            if (availableReleases.length <= 0) {

                if (filter.tag || filter.artifactVersion || filter.sourceBranch) {

                    throw new Error(`No active releases matching filter (tags: ${filter.tag}, artifact: ${filter.artifactVersion}, branch: ${filter.sourceBranch}) criteria found`);

                } else {

                    throw new Error(`No active releases found`);

                }

            }

            // Get latest release by ID
            const filteredRelease: ri.Release = availableReleases.sort((left, right) => left.id! - right.id!).reverse()[0];
            const targetRelease: ri.Release = await this.releaseApi.getRelease(projectName, filteredRelease.id!);

            // Validate release environments
            await this.validateStages(stages, targetRelease.environments!.map((i) => i.name!));

            verbose(targetRelease);

            return targetRelease;

        } catch (e) {

            throw new Error(`Unable to find target release. ${e}`);

        }

    }

    public async getRelease(project: ci.TeamProject, releaseId: number, stages: string[]): Promise<ri.Release> {

        const verbose = logger.extend("getRelease");

        let retryAttempt: number = 0;

        try {

            let targetRelease: ri.Release | undefined;

            // Retry mechanism to address
            // Intermittent ECONNRESET errors
            while (retryAttempt < this.options.attempts) {

                try {

                    retryAttempt++;

                    targetRelease = await this.releaseApi.getRelease(project.name!, releaseId);

                    retryAttempt = this.options.timeout;

                } catch {

                    console.log(`Retry retrieving release..`);

                    await this.delay(this.options.timeout);

                }

            }

            if (!targetRelease) {

                throw new Error(`Release <${releaseId}> not found`);

            }

            // Validate release environments
            await this.validateStages(stages, targetRelease.environments!.map((i) => i.name!));

            verbose(targetRelease);

            return targetRelease;

        } catch (e) {

            throw new Error(`Unable to get existing release. ${e}`);

        }

    }

    public async createRelease(project: ci.TeamProject, definition: ri.ReleaseDefinition, details: IReleaseDetails, stages?: string[], artifacts?: ri.ArtifactMetadata[]): Promise<ri.Release> {

        const verbose = logger.extend("createRelease");

        try {

            // Get release metadata
            const releaseMetadata = {

                definitionId: definition.id,
                description: `Requested via ${details.releaseName} (${details.projectName}) by ${details.requesterName}`,
                reason: ri.ReleaseReason.ContinuousIntegration,
                isDraft: false,

            } as ri.ReleaseStartMetadata;

            // Set manual stages filter
            if (stages && stages.length > 0) {

                releaseMetadata.manualEnvironments = await this.getStages(definition, stages);

            }

            // Set custom artifacts filter
            if (artifacts && artifacts.length > 0) {

                releaseMetadata.artifacts = artifacts;

            }

            // Create release
            const targetRelease: ri.Release = await this.releaseApi.createRelease(releaseMetadata, project.name!);

            verbose(targetRelease);

            return targetRelease;

        } catch (e) {

            throw new Error(`Unable to create new release. ${e}`);

        }

    }

    public async findBuild(projectName: string, definitionId: number, tags?: string[]): Promise<bi.Build> {

        const verbose = logger.extend("findBuild");

        try {

            const availableBuilds: bi.Build[] = await this.buildApi.getBuilds(
                projectName,
                [ definitionId ],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                tags);

            if (!availableBuilds) {

                throw new Error(`No ${projectName} project ${definitionId} definition builds found`);

            }

            if (availableBuilds.length <= 0) {

                if (tags) {

                    throw new Error(`No active builds matching filter (tags: ${tags}) criteria found`);

                } else {

                    throw new Error(`No active builds found`);

                }

            }

            const targetBuild: bi.Build = availableBuilds[0];

            verbose(targetBuild);

            return targetBuild;

        } catch (e) {

            throw new Error(`Unable to find target build. ${e}`);

        }

    }

    public async updateStage(status: ri.ReleaseEnvironmentUpdateMetadata, projectName: string, releaseId: number, stageId: number): Promise<ri.ReleaseEnvironment> {

        const verbose = logger.extend("updateStage");

        const releaseStage: ri.ReleaseEnvironment = await this.releaseApi.updateReleaseEnvironment(status, projectName, releaseId, stageId);

        if (!releaseStage) {

            throw new Error(`Updated stage <${stageId}> not found`);

        }

        verbose(releaseStage);

        return releaseStage;
    }

    public async updateApproval(status: ri.ReleaseApproval, projectName: string, requestId: number): Promise<ri.ReleaseApproval> {

        const verbose = logger.extend("updateApproval");

        const approvalStatus: ri.ReleaseApproval = await this.releaseApi.updateReleaseApproval(status, projectName, requestId);

        verbose(approvalStatus);

        return approvalStatus;

    }

    public async getReleaseStatus(projectName: string, releaseId: number): Promise<ri.Release> {

        const verbose = logger.extend("getReleaseStatus");

        let retryAttempt: number = 0;
        let progress: ri.Release | undefined;

        // Retry mechanism to address
        // Intermittent ECONNRESET errors
        while (retryAttempt < this.options.attempts) {

            try {

                retryAttempt++;

                progress = await this.releaseApi.getRelease(projectName, releaseId);

                retryAttempt = this.options.timeout;

            } catch {

                console.log(`Retry retrieving release status..`);

                await this.delay(this.options.timeout);

            }

        }

        if (!progress) {

            throw new Error(`Unable to get ${releaseId} release progress`);

        }

        verbose(`Release ${progress.name} status ${ri.ReleaseStatus[progress.status!]} retrieved`);

        return progress;

    }

    public async getStageStatus(releaseStatus: ri.Release, stageName: string): Promise<ri.ReleaseEnvironment> {

        const verbose = logger.extend("getStageStatus");

        const progress = releaseStatus.environments!.find((i) => i.name === stageName);

        if (!progress) {

            throw new Error(`Unable to get ${stageName} stage progress`);

        }

        verbose(`Stage ${progress.name} status ${ri.EnvironmentStatus[progress.status!]} retrieved`);

        return progress;

    }

    public async getArtifacts(projectName: string, definitionId: number, primaryId: string, versionId?: string, sourceBranch?: string): Promise<ri.ArtifactMetadata[]> {

        const verbose = logger.extend("getArtifacts");

        const result: ri.ArtifactMetadata[] = [];

        // Get available versions
        const definitionArtifacts: ri.ArtifactVersionQueryResult = await this.releaseApi.getArtifactVersions(projectName, definitionId);

        // Create artifacts metadata
        for (const artifact of definitionArtifacts.artifactVersions!) {

            // Use default (latest)
            let targetVersion: ri.BuildVersion = artifact.versions![0];

            // Filter primary artifact
            if (artifact.sourceId === primaryId) {

                // Filter by version ID
                if (versionId && !sourceBranch) {

                    targetVersion = artifact.versions!.filter((i) => i.id === versionId)[0];

                }

                // Filter by source branch
                if (sourceBranch && !versionId) {

                    targetVersion = artifact.versions!.filter((i) => i.sourceBranch === sourceBranch)[0];

                }

                // Filter by version ID and source branch
                if (versionId && sourceBranch) {

                    targetVersion = artifact.versions!.filter((i) => i.id === versionId && i.sourceBranch === sourceBranch)[0];

                }

            }

            // Validate version
            if (!targetVersion) {

                if (versionId || sourceBranch) {

                    throw new Error(`No <${artifact.alias}> artifact matching filter (version: ${versionId}, branch: ${sourceBranch}) criteria found`);

                } else {

                    throw new Error(`Unable to detect <${artifact.alias}> target artifact`);

                }

            }

            result.push({

                alias: artifact.alias,
                instanceReference: {

                    id: targetVersion.id,
                    name: targetVersion.name,
                    sourceBranch: targetVersion.sourceBranch,
                    sourceVersion: targetVersion.sourceVersion,
                    sourceRepositoryId: targetVersion.sourceRepositoryId,
                    sourceRepositoryType: targetVersion.sourceRepositoryType,

                },

            } as ri.ArtifactMetadata);
        }

        verbose(result);

        return result;

    }

    public async isAutomated(release: ri.Release): Promise<boolean> {

        const verbose = logger.extend("isAutomated");

        // Detect if environment conditions met
        // To determine automated release status
        const conditions: ri.ReleaseEnvironment[] = release.environments!.filter((e) => e.conditions!.some((i) => i.result === true));

        verbose(conditions);

        return conditions.length > 0 ? true : false;

    }

    private async getStages(definition: ri.ReleaseDefinition, stages: string[]): Promise<string[]> {

        // Get definition stages
        const definitionStages: string[] = definition.environments!.map((i) => i.name!);

        // Validate definition environments
        await this.validateStages(stages, definitionStages);

        return definitionStages.filter((i) => stages.indexOf(i) === -1);

    }

    private async validateStages(required: string[], existing: string[]): Promise<void> {

        for (const stage of required) {

            if (existing.indexOf(stage) === -1) {

                throw new Error(`Release does not contain <${stage}> stage`);

            }

        }

    }

    private async delay(ms: number) {

        const verbose = logger.extend("delay");

        verbose(`Start ${ms}ms delay`);

        return new Promise((resolve) => setTimeout(resolve, ms));

    }

}
