import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import * as ci from "azure-devops-node-api/interfaces/CoreInterfaces";

import { ReleaseType, IParameters, IReleaseParameters, IOrchestrator, IDeployer, IHelper, IReleaseDetails } from "./interfaces";

export class Orchestrator implements IOrchestrator {

    private helper: IHelper;
    private deployer: IDeployer;

    constructor(helper: IHelper, deployer: IDeployer) {

        this.helper = helper;
        this.deployer = deployer;

    }

    async deployRelease(parameters: IParameters, details: IReleaseDetails) {

        // Get targets
        const targetProject: ci.TeamProject = await this.helper.getProject(parameters.projectId);

        if (!targetProject) {

            throw new Error(`Project ${parameters.projectId} not found`);

        }

        const targetDefinition: ri.ReleaseDefinition = await this.helper.getDefinition(targetProject.name!, Number(parameters.definitionId));

        if (!targetDefinition) {

            throw new Error(`Definition ${parameters.definitionId} not found`);

        }

        console.log(`Starting <${targetProject.name}> project ${ReleaseType[parameters.releaseType].toLowerCase()} <${targetDefinition.name}> release deployment`);

        // Get target release
        const targetRelease: ri.Release = await this.getRelease(parameters.releaseType, targetProject, targetDefinition, details, parameters);

        // Get target stages
        const targetStages: string[] = parameters.stages ? parameters.stages : targetRelease.environments!.map((i) => i.name!);

        // Get release parameters
        const releaseParameters = this.getReleaseParameters(targetProject, targetRelease, targetStages, 5000);

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

        let release: ri.Release;

        switch (type) {

            case ReleaseType.Create: {

                let filteredArtifact = undefined;

                // Get primary definition artifact
                const primaryArtifact: ri.Artifact = definition.artifacts!.filter(i => i.isPrimary == true)[0];

                if (primaryArtifact) {

                    let artifactVersion = undefined;

                    // Get build matching artifact tag
                    if (parameters.artifactTag && parameters.artifactTag.length >= 1) {

                        console.log(`Using <${parameters.artifactTag}> artifact tag(s) for target release filter`);

                        const targetArtifactDefinition = await this.helper.getArtifactDefinition(definition);
                        const targetArtifactBuild = await this.helper.findBuild(project.name!, Number(targetArtifactDefinition.id), parameters.artifactTag);

                        artifactVersion = String(targetArtifactBuild.id);

                    }

                    // Confirm source branch filter
                    if (parameters.sourceBranch) {

                        console.log(`Using <${parameters.sourceBranch}> artifact branch for target release filter`);

                    }

                    filteredArtifact = await this.helper.getArtifacts(project.name!, definition.id!, primaryArtifact.sourceId!, artifactVersion, parameters.sourceBranch);

                }

                // Create new
                release = await this.helper.createRelease(project, definition, details, parameters.stages, filteredArtifact);

                break;

            }

            case ReleaseType.Latest: {

                let artifactVersion = undefined;

                // Confirm release tag filter
                if (parameters.releaseTag && parameters.releaseTag.length >= 1) {

                    console.log(`Using <${parameters.releaseTag}> tag(s) for target release filter`);

                }

                // Get build matching artifact tag
                if (parameters.artifactTag && parameters.artifactTag.length >= 1) {

                    console.log(`Using <${parameters.artifactTag}> artifact tag(s) for target release filter`);

                    const targetArtifactDefinition = await this.helper.getArtifactDefinition(definition);
                    const targetArtifactBuild = await this.helper.findBuild(project.name!, Number(targetArtifactDefinition.id), parameters.artifactTag);

                    artifactVersion = String(targetArtifactBuild.id);

                }

                // Confirm source branch filter
                if (parameters.sourceBranch) {

                    console.log(`Using <${parameters.sourceBranch}> artifact branch for target release filter`);

                }

                release = await this.helper.findRelease(project.name!, definition.id!, parameters.stages, parameters.sourceBranch, artifactVersion, parameters.releaseTag);

                break;

            }

            case ReleaseType.Specific: {

                // Use existing
                release = await this.helper.getRelease(project, Number(parameters.releaseId), parameters.stages);

                break;

            }

            default: {

                throw new Error(`Unable to get or create release`);

            }

        }

        return release;

    }

    private getReleaseParameters(project: ci.TeamProject, release: ri.Release, stages: string[], sleep: number): IReleaseParameters {

        return {

            projectName: project.name,
            releaseId: release.id,
            releaseStages: stages,
            sleep: sleep

        } as IReleaseParameters

    }

}
