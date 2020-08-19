import { IReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { ReleaseDefinition, Release, ReleaseStatus, ReleaseExpands, ArtifactMetadata, ArtifactVersionQueryResult, BuildVersion, ReleaseReason, ReleaseStartMetadata, ReleaseEnvironment, EnvironmentStatus, ReleaseApproval, ReleaseEnvironmentUpdateMetadata, ApprovalStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseFilter } from "../interfaces/common/releasefilter";
import { IArtifactFilter } from "../interfaces/common/artifactfilter";
import { DeploymentType } from "../interfaces/common/deploymenttype";
import { IDetails } from "../interfaces/task/details";

export class ReleaseHelper implements IReleaseHelper {

    private debugLogger: IDebugLogger;

    private releaseApi: IReleaseApi;

    constructor(releaseApi: IReleaseApi, debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

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

    public async getRelease(projectName: string, releaseId: number, stages: string[]): Promise<Release> {

        const debug = this.debugLogger.extend(this.getRelease.name);

        const targetRelease: Release = await this.releaseApi.getRelease(projectName, releaseId);

        if (!targetRelease) {

            throw new Error(`Release <${releaseId}> not found`);

        }

        await this.validateReleaseStages(targetRelease, stages);

        debug(targetRelease);

        return targetRelease;

    }

    public async getReleases(projectName: string, definitionId: number, status: ReleaseStatus, filter: IReleaseFilter): Promise<Release[]> {

        const debug = this.debugLogger.extend(this.getReleases.name);

        const releases: Release[] = await this.releaseApi.getReleases(
            projectName,
            definitionId,
            undefined,
            undefined,
            undefined,
            status,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ReleaseExpands.Artifacts,
            undefined,
            undefined,
            filter.artifactVersion ? filter.artifactVersion : undefined,
            filter.sourceBranch ? filter.sourceBranch : undefined,
            undefined,
            (filter.tag && filter.tag.length) ? filter.tag : undefined);

        if (releases.length <= 0) {

            if (filter.tag || filter.artifactVersion || filter.sourceBranch) {

                throw new Error(`No <${definitionId}> definition releases matching filter (tags: ${filter.tag}, artifact: ${filter.artifactVersion}, branch: ${filter.sourceBranch}) criteria found`);

            } else {

                throw new Error(`No <${definitionId}> definition releases found`);

            }

        }

        debug(`Found <${releases.length}> (${ReleaseStatus[status]}) release(s) matching filter (tags: ${filter.tag}, artifact: ${filter.artifactVersion}, branch: ${filter.sourceBranch})`);

        return releases;

    }

    public async getLastRelease(projectName: string, definitionId: number, stages: string[], filter: IReleaseFilter): Promise<Release> {

        const debug = this.debugLogger.extend(this.getLastRelease.name);

        const availableReleases: Release[] = await this.getReleases(projectName, definitionId, ReleaseStatus.Active, filter);

        // Find latest release by ID
        const filteredRelease: Release = availableReleases.sort(
            (left, right) => left.id! - right.id!).reverse()[0];

        const targetRelease: Release = await this.releaseApi.getRelease(projectName, filteredRelease.id!);

        await this.validateReleaseStages(targetRelease, stages);

        debug(targetRelease);

        return targetRelease;

    }

    public async createRelease(projectName: string, definition: ReleaseDefinition, details: IDetails, stages?: string[], artifacts?: IArtifactFilter[]): Promise<Release> {

        const debug = this.debugLogger.extend(this.createRelease.name);

        // Get release metadata
        const releaseMetadata: ReleaseStartMetadata = {

            definitionId: definition.id,
            description: `Requested via ${details.releaseName} (${details.projectName}) by ${details.requesterName}`,
            reason: ReleaseReason.ContinuousIntegration,
            isDraft: false,

        };

        // Set manual stages filter
        if (stages && stages.length > 0) {

            releaseMetadata.manualEnvironments = await this.getDefinitionStages(definition, stages);

        }

        // Set custom artifacts filter
        if (artifacts && artifacts.length > 0) {

            releaseMetadata.artifacts = artifacts;

        }

        // Create release
        const targetRelease: Release = await this.releaseApi.createRelease(releaseMetadata, projectName);

        debug(targetRelease);

        return targetRelease;

    }

    public async getReleaseStatus(projectName: string, releaseId: number): Promise<Release> {

        const debug = this.debugLogger.extend(this.getReleaseStatus.name);

        const releaseStatus: Release = await this.releaseApi.getRelease(projectName, releaseId);

        if (!releaseStatus) {

            throw new Error(`Unable to get <${releaseId}> release status`);

        }

        debug(`Release <${releaseStatus.name}> status <${ReleaseStatus[releaseStatus.status!]}> retrieved`);

        return releaseStatus;

    }

    public async getStageStatus(release: Release, stageName: string): Promise<ReleaseEnvironment> {

        const debug = this.debugLogger.extend(this.getStageStatus.name);

        const targetStage: ReleaseEnvironment = release.environments!.find((i) => i.name === stageName)!;

        if (!targetStage) {

            throw new Error(`Unable to get <${stageName}> stage status`);

        }

        debug(`Stage <${targetStage.name}> status <${EnvironmentStatus[targetStage.status!]}> retrieved`);

        return targetStage;

    }

    public async getArtifacts(projectName: string, definitionId: number, primaryId: string, versionId?: string, sourceBranch?: string): Promise<ArtifactMetadata[]> {

        const debug = this.debugLogger.extend(this.getArtifacts.name);

        const targetArtifacts: ArtifactMetadata[] = [];

        // Get available versions
        const definitionArtifacts: ArtifactVersionQueryResult = await this.releaseApi.getArtifactVersions(projectName, definitionId);

        // Create artifacts metadata
        for (const artifact of definitionArtifacts.artifactVersions!) {

            debug(artifact);

            if (artifact.errorMessage) {

                throw new Error(`Artifact <${artifact.alias}> error. ${artifact.errorMessage}`);

            }

            // Use default (latest)
            let targetVersion: BuildVersion = artifact.versions![0];

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

                    throw new Error(`No <${artifact.alias}> artifact matching filter found (version: ${versionId}, branch: ${sourceBranch})`);

                } else {

                    throw new Error(`No <${artifact.alias}> artifact versions found`);

                }

            }

            const targetArtifcat: ArtifactMetadata = {

                alias: artifact.alias,
                instanceReference: {

                    id: targetVersion.id,
                    name: targetVersion.name,
                    sourceBranch: targetVersion.sourceBranch,
                    sourceVersion: targetVersion.sourceVersion,
                    sourceRepositoryId: targetVersion.sourceRepositoryId,
                    sourceRepositoryType: targetVersion.sourceRepositoryType,

                },

            };

            targetArtifacts.push(targetArtifcat);
        }

        debug(targetArtifacts);

        return targetArtifacts;

    }

    public async getDefinitionStages(definition: ReleaseDefinition, stages: string[]): Promise<string[]> {

        const debug = this.debugLogger.extend(this.getDefinitionStages.name);

        await this.validateDefinitionStages(definition, stages);

        const targetStages: string[] = definition.environments!.map(
            (stage) => stage.name!).filter(
                (stage) => stages.indexOf(stage) === -1);

        debug(targetStages);

        return targetStages;

    }

    public async getReleaseStages(release: Release, stages: string[]): Promise<string[]> {

        const debug = this.debugLogger.extend(this.getReleaseStages.name);

        const releaseStages: string[] = release.environments!.map((i) => i.name!);

        const targetStages: string[] = (stages && stages.length > 0)
            ? stages : releaseStages;

        debug(targetStages);

        return targetStages;

    }

    public async getStageApprovals(stage: ReleaseEnvironment, status: ApprovalStatus): Promise<ReleaseApproval[]> {

        const debug = this.debugLogger.extend(this.getStageApprovals.name);

        const stageApprovals: ReleaseApproval[] = stage.preDeployApprovals!.filter((approval) =>
            approval.status === status);

        debug(stageApprovals);

        return stageApprovals;

    }

    public async getReleaseType(release: Release): Promise<DeploymentType> {

        const debug = this.debugLogger.extend(this.getReleaseType.name);

        let releaseType: DeploymentType;

        // Detect wether stage deployment conditions are met
        // In order to determine automated release status
        const conditionStages: ReleaseEnvironment[] = release.environments!.filter((e) => e.conditions!.some((i) => i.result === true));

        debug(conditionStages);

        const conditionsMet: boolean = conditionStages.length > 0 ? true : false;

        if (conditionsMet) {

            releaseType = DeploymentType.Automated;

        } else {

            releaseType = DeploymentType.Manual;

        }

        debug(releaseType);

        return releaseType;

    }

    public async startStage(stage: ReleaseEnvironment, projectName: string, message: string): Promise<ReleaseEnvironment> {

        const debug = this.debugLogger.extend(this.startStage.name);

        const startRequest: ReleaseEnvironmentUpdateMetadata = {

            status: EnvironmentStatus.InProgress,
            comment: message,

        };

        const stageStatus: ReleaseEnvironment = await this.releaseApi.updateReleaseEnvironment(startRequest, projectName, stage.release!.id!, stage.id!);

        debug(stageStatus);

        return stageStatus;

    }

    public async cancelStage(stage: ReleaseEnvironment, projectName: string, message: string): Promise<ReleaseEnvironment> {

        const debug = this.debugLogger.extend(this.cancelStage.name);

        const cancelRequest: ReleaseEnvironmentUpdateMetadata = {

            status: EnvironmentStatus.Canceled,
            comment: message,

        };

        const stageStatus: ReleaseEnvironment = await this.releaseApi.updateReleaseEnvironment(cancelRequest, projectName, stage.release!.id!, stage.id!);

        debug(stageStatus);

        return stageStatus;

    }

    public async approveStage(releaseApproval: ReleaseApproval, projectName: string, message: string): Promise<ReleaseApproval> {

        const debug = this.debugLogger.extend(this.approveStage.name);

        const approvalRequest: ReleaseApproval = {

            status: ApprovalStatus.Approved,
            comments: message,

        };

        const approvalStatus: ReleaseApproval = await this.releaseApi.updateReleaseApproval(approvalRequest, projectName, releaseApproval.id!);

        debug(approvalStatus);

        return approvalStatus;

    }

    private async validateReleaseStages(release: Release, required: string[]): Promise<void> {

        const debug = this.debugLogger.extend(this.validateReleaseStages.name);

        const releaseStages: string[] = release.environments!.map(
            (stage) => stage.name!);

        for (const stage of required) {

            if (releaseStages.indexOf(stage) === -1) {

                throw new Error(`Release <${release.name}> does not contain <${stage}> stage`);

            }

        }

    }

    private async validateDefinitionStages(definition: ReleaseDefinition, required: string[]): Promise<void> {

        const debug = this.debugLogger.extend(this.validateDefinitionStages.name);

        const definitionStages: string[] = definition.environments!.map(
            (stage) => stage.name!);

        for (const stage of required) {

            if (definitionStages.indexOf(stage) === -1) {

                throw new Error(`Definition <${definition.name}> does not contain <${stage}> stage`);

            }

        }

    }

}
