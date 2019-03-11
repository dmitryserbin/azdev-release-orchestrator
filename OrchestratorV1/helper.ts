import * as ci from "azure-devops-node-api/interfaces/CoreInterfaces";
import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import * as bi from "azure-devops-node-api/interfaces/BuildInterfaces";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";
import * as ba from "azure-devops-node-api/BuildApi";

import { IHelper, IReleaseDetails } from "./interfaces";

export class Helper implements IHelper {

    private coreApi: ca.ICoreApi;
    private releaseApi: ra.IReleaseApi;
    private buildApi: ba.IBuildApi;

    constructor(coreApi: ca.ICoreApi, releaseApi: ra.IReleaseApi, buildApi: ba.IBuildApi) {

        this.coreApi = coreApi;
        this.releaseApi = releaseApi;
        this.buildApi = buildApi;
        
    }

    async getProject(projectId: string): Promise<ci.TeamProject> {

        const targetProject = await this.coreApi.getProject(projectId);

        if (!targetProject) {

            throw new Error(`Project <${projectId}> not found`);

        }

        return targetProject;

    }

    async getDefinition(projectName: string, definitionId: number): Promise<ri.ReleaseDefinition> {

        const targetDefinition: ri.ReleaseDefinition = await this.releaseApi.getReleaseDefinition(projectName, definitionId);
    
        if (!targetDefinition) {
    
            throw new Error(`Definition <${definitionId}> not found`);
    
        }

        return targetDefinition;

    }

    async findRelease(projectName: string, definitionId: number, stages: string[], sourceBranch?: string, artifactVersion?: string, tags?: string[]): Promise<ri.Release> {

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
                artifactVersion ? artifactVersion : undefined,
                sourceBranch ? sourceBranch : undefined,
                undefined,
                tags ? tags : undefined);

            if (!availableReleases) {

                throw new Error(`No ${projectName} project ${definitionId} definition releases found`);

            }

            if (availableReleases.length <= 0) {

                if (sourceBranch || artifactVersion || tags) {

                    throw new Error(`No active releases matching filter (branch: ${sourceBranch}, version: ${artifactVersion}, tags: ${tags}) criteria found`);

                } else {

                    throw new Error(`No active releases found`);

                }
                
            }

            // Get latest release by ID
            const filteredRelease: ri.Release = availableReleases.sort((left, right) => left.id - right.id).reverse()[0];
            const targetRelease: ri.Release = await this.releaseApi.getRelease(projectName, filteredRelease.id);

            // Validate release environments
            await this.validateStages(stages, targetRelease.environments.map((i) => i.name));

            return targetRelease;

        } catch (e) {

            throw new Error(`Unable to find target release. ${e}`);

        }

    }

    async getRelease(project: ci.TeamProject, releaseId: number, stages: string[]): Promise<ri.Release> {

        try {

            const targetRelease: ri.Release = await this.releaseApi.getRelease(project.name, releaseId);
        
            // Validate release environments
            await this.validateStages(stages, targetRelease.environments.map((i) => i.name));
        
            return targetRelease;

        } catch (e) {

            throw new Error(`Unable to get existing release. ${e}`);

        }

    }

    async createRelease(project: ci.TeamProject, definition: ri.ReleaseDefinition, details: IReleaseDetails, stages?: string[], artifact?: any): Promise<ri.Release> {

        try {

            // Get release metadata
            const releaseMetadata = {

                definitionId: definition.id,
                description: `Requested via ${details.releaseName} (${details.projectName}) by ${details.requesterName}`,
                reason: ri.ReleaseReason.ContinuousIntegration,
                isDraft: false,

            } as ri.ReleaseStartMetadata;

            // Set manual stages filter
            if (stages) {

                releaseMetadata.manualEnvironments = await this.getStages(definition, stages);

            }

            // Set target artifacts filter
            if (artifact) {

                releaseMetadata.artifacts = await this.getArtifacts(project.name, definition.id, artifact);

            }

            // Create release
            return this.releaseApi.createRelease(releaseMetadata, project.name);

        } catch (e) {

            throw new Error(`Unable to create new release. ${e}`);

        }

    }

    async findBuild(projectName: string, definitionId: number, tags?: string[]): Promise<bi.Build> {

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

            return availableBuilds[0];

        } catch (e) {

            throw new Error(`Unable to find target build. ${e}`);

        }

    }

    async getArtifactDefinition(definition: ri.ReleaseDefinition): Promise<ri.ArtifactSourceReference> {

        const primaryArtifact: ri.Artifact = definition.artifacts.filter((i) => i.isPrimary == true && i.type == "Build")[0];

        if (!primaryArtifact) {

            throw new Error(`No primary build artifact found`);

        }

        return primaryArtifact.definitionReference.definition;

    }

    async isAutomated(release: ri.Release): Promise<boolean> {

        // Detect if environment conditions met
        // To determine automated release status
        const conditions: number = release.environments.filter((e) => e.conditions.some((i) => i.result === true)).length;
        
        return conditions > 0 ? true : false;

    }

    private async getStages(definition: ri.ReleaseDefinition, stages: string[]): Promise<string[]> {

        // Get definition stages
        const definitionStages = definition.environments.map((i) => i.name);

        // Validate definition environments
        await this.validateStages(stages, definitionStages);

        return definitionStages.filter((i) => stages.indexOf(i) === -1);

    }

    private async getArtifacts(projectName: string, definitionId: number, artifact: any): Promise<ri.ArtifactMetadata[]> {

        const definitionArtifacts: ri.ArtifactVersionQueryResult = await this.releaseApi.getArtifactVersions(projectName, definitionId);

        const releaseArtifacts: ri.ArtifactMetadata[] = [];

        for (const result of definitionArtifacts.artifactVersions) {

            const targetVersion = (result.alias === artifact.alias) ?

                // Get specified artifact
                (result.versions.filter((i) => i.id === artifact.version)[0]) :

                // Get latest artifact
                (result.versions[0]);

            if (!targetVersion) {

                throw new Error(`Unable to detect <${result.alias}> target artifact`);

            }

            // Add to release artifacts
            releaseArtifacts.push({

                alias: result.alias,
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

        return releaseArtifacts;

    }

    private async validateStages(required: string[], existing: string[]): Promise<void> {

        for (const stage of required) {

            if (existing.indexOf(stage) === -1) {
    
                throw new Error(`Release does not contain <${stage}> stage`);
    
            }
    
        }

    }

}
