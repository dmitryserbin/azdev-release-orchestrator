import { ReleaseDefinition, Release, ReleaseStatus, ArtifactMetadata, ArtifactVersionQueryResult, BuildVersion, ReleaseReason, ReleaseStartMetadata, ReleaseEnvironment, EnvironmentStatus, ReleaseApproval, ReleaseEnvironmentUpdateMetadata, ApprovalStatus, ReleaseExpands, ConfigurationVariableValue, Artifact } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseFilter } from "../interfaces/common/releasefilter";
import { IArtifactFilter } from "../interfaces/common/artifactfilter";
import { DeploymentType } from "../interfaces/common/deploymenttype";
import { IReleaseApiRetry } from "../interfaces/extensions/releaseapiretry";
import { IReleaseVariable } from "../interfaces/common/releasevariable";
import { IDetails } from "../interfaces/task/details";

export class ReleaseHelper implements IReleaseHelper {

    private debugLogger: IDebugLogger;

    private releaseApi: IReleaseApiRetry;

    constructor(releaseApi: IReleaseApiRetry, debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

        this.releaseApi = releaseApi;

    }

    public async getDefinition(projectName: string, definitionName: string): Promise<ReleaseDefinition> {

        const debug = this.debugLogger.extend(this.getDefinition.name);

        const matchingDefinitions: ReleaseDefinition[] = await this.releaseApi.getReleaseDefinitions(
            projectName,
            definitionName,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            true);

        debug(matchingDefinitions.map(
            (definition) => `${definition.name} (${definition.id})`));

        if (matchingDefinitions.length <= 0) {

            throw new Error(`Definition <${definitionName}> not found`);

        }

        const targetDefinition: ReleaseDefinition = await this.releaseApi.getReleaseDefinition(projectName, matchingDefinitions[0].id!);

        debug(targetDefinition);

        return targetDefinition;

    }

    public async getRelease(projectName: string, definitionId: number, releaseName: string, stages: string[]): Promise<Release> {

        const debug = this.debugLogger.extend(this.getRelease.name);

        const matchingReleases: Release[] = await this.releaseApi.getReleases(
            projectName,
            definitionId,
            undefined,
            releaseName
        );

        debug(matchingReleases.map(
            (release) => `${release.name} (${release.id})`));

        if (matchingReleases.length <= 0) {

            throw new Error(`Release <${releaseName}> not found`);

        }

        const targetRelease: Release = await this.releaseApi.getRelease(projectName, matchingReleases[0].id!);

        await this.validateReleaseStages(targetRelease, stages);

        debug(targetRelease);

        return targetRelease;

    }

    public async findReleases(projectName: string, definitionName: string, definitionId: number, filter: IReleaseFilter, top: number): Promise<Release[]> {

        const debug = this.debugLogger.extend(this.findReleases.name);

        debug(filter);

        let releases: Release[] = await this.releaseApi.getReleases(
            projectName,
            definitionId,
            undefined,
            undefined,
            undefined,
            filter.releaseStatus,
            undefined,
            undefined,
            undefined,
            top,
            undefined,
            undefined,
            ReleaseExpands.Environments,
            undefined,
            undefined,
            (filter.artifactVersionId ? filter.artifactVersionId.toString() : undefined),
            filter.artifactBranch,
            undefined,
            filter.tags);

        if (filter.stageStatuses.length) {

            const filtered: Release[] = [];

            for (const release of releases) {

                const stagesStatusMatch: boolean = await this.validateReleaseStagesStatus(release, filter.stages, filter.stageStatuses);

                if (stagesStatusMatch) {

                    filtered.push(release);

                }

            }

            releases = filtered;

        }

        if (!releases.length) {

            throw new Error(`No definition <${definitionName}> (${definitionId}) releases matching filter found`);

        }

        debug(`Found <${releases.length}> (${ReleaseStatus[filter.releaseStatus]}) release(s) matching filter`);

        debug(releases.map(
            (release) => `${release.name} (${release.id})`));

        return releases;

    }

    public async getLastRelease(projectName: string, definitionName: string, definitionId: number, stages: string[], filter: IReleaseFilter, top: number): Promise<Release> {

        const debug = this.debugLogger.extend(this.getLastRelease.name);

        const filteredReleases: Release[] = await this.findReleases(projectName, definitionName, definitionId, filter, top);

        // Get latest release by ID
        const filteredRelease: Release = filteredReleases.sort(
            (left, right) => left.id! - right.id!).reverse()[0];

        const targetRelease: Release = await this.releaseApi.getRelease(projectName, filteredRelease.id!);

        await this.validateReleaseStages(targetRelease, stages);

        debug(targetRelease);

        return targetRelease;

    }

    public async createRelease(projectName: string, definition: ReleaseDefinition, details: IDetails, stages?: string[], variables?: IReleaseVariable[], artifacts?: IArtifactFilter[]): Promise<Release> {

        const debug = this.debugLogger.extend(this.createRelease.name);

        // Get release metadata
        const releaseMetadata: ReleaseStartMetadata = {

            definitionId: definition.id,
            description: `Requested via <${details.releaseName}> (${details.projectName}) by ${details.requesterName}`,
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

        // Set release variables
        if (variables && variables.length > 0) {

            releaseMetadata.variables = await this.formatReleaseVariables(variables);

            const requiredVariables: string[] = variables.map((variable) => variable.name);

            await this.validateDefinitionVariables(definition, requiredVariables);

        }

        debug(releaseMetadata);

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

    public async getArtifacts(projectName: string, definitionId: number, primaryId: string, versionId?: string, branchName?: string): Promise<ArtifactMetadata[]> {

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
                if (versionId && !branchName) {

                    targetVersion = artifact.versions!.filter((i) => i.id === versionId)[0];

                }

                // Filter by source branch
                if (branchName && !versionId) {

                    targetVersion = artifact.versions!.filter((i) => i.sourceBranch === branchName)[0];

                }

                // Filter by version ID and source branch
                if (versionId && branchName) {

                    targetVersion = artifact.versions!.filter((i) => i.id === versionId && i.sourceBranch === branchName)[0];

                }

            }

            // Validate version
            if (!targetVersion) {

                throw new Error(`No artifact <${artifact.alias}> matching filter found`);

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

    public async getDefinitionPrimaryArtifact(definition: ReleaseDefinition, type: string): Promise<Artifact | undefined> {

        const debug = this.debugLogger.extend(this.getDefinitionPrimaryArtifact.name);

        let artifact: Artifact | undefined;

        if (Array.isArray(definition.artifacts) && definition.artifacts.length) {

            artifact = definition.artifacts!.filter(
                (i) => i.isPrimary === true && i.type === type)[0]

        }

        debug(artifact);

        return artifact;

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

        for (const approval of stageApprovals) {

            debug(`Stage <${stage.name}> approval <${approval.id}> (${ApprovalStatus[approval.status!]}) status <${approval.attempt}> attempt`);

        }

        return stageApprovals;

    }

    public async getReleaseType(release: Release): Promise<DeploymentType> {

        const debug = this.debugLogger.extend(this.getReleaseType.name);

        let releaseType: DeploymentType;

        // Detect wether stage deployment conditions are met
        // In order to determine automated release status
        const conditionStages: ReleaseEnvironment[] = release.environments!.filter(
            (stage) => stage.conditions!.some(
                (condition) => condition.result === true));

        for (const stage of conditionStages) {

            debug(`Stage ${stage.name} (${stage.id}) has <${stage.conditions!.length}> condition(s)`);
            debug(stage.conditions);

        }


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

        debug(releaseStages);

        for (const stage of required) {

            if (releaseStages.indexOf(stage) === -1) {

                throw new Error(`Release <${release.name}> does not contain <${stage}> stage`);

            }

        }

    }

    private async validateReleaseStagesStatus(release: Release, stages: string[], statuses: EnvironmentStatus[]): Promise<boolean> {

        const debug = this.debugLogger.extend(this.validateReleaseStagesStatus.name);

        const match: boolean = stages.every((requiredStage) => {

            const releaseStage = release.environments!.find(
                (i) => i.name === requiredStage);

            if (releaseStage) {

                const statusMatch: boolean = statuses.includes(releaseStage.status!);

                return statusMatch;

            } else {

                return false;

            }

        });

        debug(`Release <${release.name}> (${release.id}) match <${match}>`);

        return match;

    }

    private async validateDefinitionStages(definition: ReleaseDefinition, required: string[]): Promise<void> {

        const debug = this.debugLogger.extend(this.validateDefinitionStages.name);

        const definitionStages: string[] = definition.environments!.map(
            (stage) => stage.name!);

        debug(definitionStages);

        for (const stage of required) {

            if (definitionStages.indexOf(stage) === -1) {

                throw new Error(`Definition <${definition.name}> does not contain <${stage}> stage`);

            }

        }

    }

    private async validateDefinitionVariables(definition: ReleaseDefinition, required: string[]): Promise<void> {

        const debug = this.debugLogger.extend(this.validateDefinitionVariables.name);

        debug(definition.variables);

        for (const variable of required) {

            const definitionVariable: ConfigurationVariableValue = definition.variables![variable];

            if (!definitionVariable) {

                throw new Error(`Release variable <${variable}> does not exist`);

            }

            if (!definitionVariable.allowOverride) {

                throw new Error(`Release variable <${variable}> is not settable at release time`);

            }

            debug(`Release variable <${variable}> (overridable) found`);

        }

    }

    private async formatReleaseVariables(variables: IReleaseVariable[]): Promise<{ [key: string]: ConfigurationVariableValue }> {

        const releaseVariables: { [key: string]: ConfigurationVariableValue } = {};

        for (const variable of variables) {

            const value: ConfigurationVariableValue = {

                value: variable.value,

            }

            releaseVariables[variable.name] = value;

        }

        return releaseVariables;

    }

}
