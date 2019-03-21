import Debug from "debug";

import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import * as bi from "azure-devops-node-api/interfaces/BuildInterfaces";
import * as ci from "azure-devops-node-api/interfaces/CoreInterfaces";

import { ReleaseType, IParameters, IReleaseParameters, IOrchestrator, IDeployer, IHelper, IReleaseDetails, IReleaseFilter } from "./interfaces";

const logger = Debug("release-orchestrator:Orchestrator");

export class Orchestrator implements IOrchestrator {

    private helper: IHelper;
    private deployer: IDeployer;

    constructor(helper: IHelper, deployer: IDeployer) {

        this.helper = helper;
        this.deployer = deployer;

    }

    async deployRelease(parameters: IParameters, details: IReleaseDetails) {

        const verbose = logger.extend("deployRelease");

        // Get target project
        const targetProject: ci.TeamProject = await this.helper.getProject(parameters.projectId);

        // Get target definition
        const targetDefinition: ri.ReleaseDefinition = await this.helper.getDefinition(targetProject.name!, Number(parameters.definitionId));

        console.log(`Starting <${targetProject.name}> project ${ReleaseType[parameters.releaseType].toLowerCase()} <${targetDefinition.name}> release deployment`);

        // Get target release
        const targetRelease: ri.Release = await this.getRelease(parameters.releaseType, targetProject, targetDefinition, details, parameters);

        // Get target stages
        const targetStages: string[] = (parameters.stages && parameters.stages.length > 0) ? parameters.stages : targetRelease.environments!.map((i) => i.name!);

        if (targetStages.length == 0) {

            throw new Error(`Unable to detect ${targetRelease.name} release stages`);

        }

        verbose(targetStages);

        // Get release parameters
        const releaseParameters = {

            projectName: targetProject.name,
            releaseId: targetRelease.id,
            releaseStages: targetStages,
            sleep: 5000,

        } as IReleaseParameters;

        verbose(parameters.releaseType);
        
        // Deploy new release
        if (parameters.releaseType === ReleaseType.Create) {

            console.log(`Deploying <${targetRelease.name}> (${targetRelease.id}) pipeline <${targetStages}> stage(s) release`);

            if (await this.helper.isAutomated(targetRelease)) {

                console.log(`Release automatically started as stages deployment conditions are met`);

                // Monitor automatically started stages deployment progess
                await this.deployer.deployAutomated(releaseParameters, details);

            } else {

                console.log(`Release orchestrated manually as stages deployment conditions are NOT met`);

                // Manually trigger stages deployment and monitor progress
                await this.deployer.deployManual(releaseParameters, details);

            }

        // Re-deploy existing release
        } else {

            console.log(`Re-deploying <${targetRelease.name}> (${targetRelease.id}) pipeline <${targetStages}> stage(s) release`);

            // Manually trigger stages deployment and monitor progress
            await this.deployer.deployManual(releaseParameters, details);

        }

    }

    async getRelease(type: ReleaseType, project: ci.TeamProject, definition: ri.ReleaseDefinition, details: IReleaseDetails, parameters: IParameters): Promise<ri.Release> {

        const verbose = logger.extend("getRelease");

        let release: ri.Release;

        verbose(type);

        switch (type) {

            case ReleaseType.Create: {

                // Get new release filtered artifacts
                const filteredArtifact: ri.ArtifactMetadata[] = await this.getReleaseArtifact(project, definition, parameters.artifactTag, parameters.sourceBranch);

                release = await this.helper.createRelease(project, definition, details, parameters.stages, filteredArtifact);

                break;

            }

            case ReleaseType.Latest: {

                // Get existing release filters
                const releaseFilters: IReleaseFilter = await this.getReleaseFilters(project, definition, parameters.releaseTag, parameters.artifactTag, parameters.sourceBranch);

                release = await this.helper.findRelease(project.name!, definition.id!, parameters.stages, releaseFilters);

                break;

            }

            case ReleaseType.Specific: {

                release = await this.helper.getRelease(project, Number(parameters.releaseId), parameters.stages);

                break;

            }

            default: {

                throw new Error(`Unable to get or create release`);

            }

        }

        return release;

    }

    private async getReleaseArtifact(project: ci.TeamProject, definition: ri.ReleaseDefinition, artifactTag?: string[], sourceBranch?: string): Promise<ri.ArtifactMetadata[]> {

        const verbose = logger.extend("getReleaseArtifact");

        let result: ri.ArtifactMetadata[] = [];

        // Get primary definition build artifact
        const primaryArtifact: ri.Artifact = definition.artifacts!.filter(i => i.isPrimary == true && i.type == "Build")[0];

        if (primaryArtifact) {

            let artifactVersion = undefined;

            // Get build matching artifact tag
            if (artifactTag && artifactTag.length >= 1) {

                console.log(`Using <${artifactTag}> artifact tag(s) for target release filter`);

                const targetArtifactBuild: bi.Build = await this.helper.findBuild(project.name!, Number(primaryArtifact.definitionReference!.definition.id), artifactTag);

                artifactVersion = String(targetArtifactBuild.id);

            }

            // Confirm source branch filter
            if (sourceBranch) {

                console.log(`Using <${sourceBranch}> artifact branch for target release filter`);

            }

            result = await this.helper.getArtifacts(project.name!, definition.id!, primaryArtifact.sourceId!, artifactVersion, sourceBranch);

        }

        verbose(result);

        return result;

    }

    private async getReleaseFilters(project: ci.TeamProject, definition: ri.ReleaseDefinition, releaseTag?: string[], artifactTag?: string[], sourceBranch?: string): Promise<IReleaseFilter> {

        const verbose = logger.extend("getReleaseFilters");

        let result: IReleaseFilter = {

            artifactVersion: undefined,
            sourceBranch: undefined,
            tag: undefined,

        };

        // Get primary definition build artifact
        const primaryArtifact: ri.Artifact = definition.artifacts!.filter(i => i.isPrimary == true && i.type == "Build")[0];

        // Get release tag filter
        if (releaseTag && releaseTag.length >= 1) {

            console.log(`Using <${releaseTag}> tag(s) for target release filter`);

            result.tag = releaseTag;

        }

        if (primaryArtifact) {

            // Get artifact tag filter
            if (artifactTag && artifactTag.length >= 1) {

                console.log(`Using <${artifactTag}> artifact tag(s) for target release filter`);

                // Get build matching artifact tag
                const targetArtifactBuild: bi.Build = await this.helper.findBuild(project.name!, Number(primaryArtifact.definitionReference!.definition.id), artifactTag);

                result.artifactVersion = String(targetArtifactBuild.id);

            }

            // Get source branch filter
            if (sourceBranch) {

                console.log(`Using <${sourceBranch}> artifact branch for target release filter`);

                result.sourceBranch = sourceBranch;

            }

        }

        verbose(result);

        return result;

    }

}
