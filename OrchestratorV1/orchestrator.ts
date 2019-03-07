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
        const targetDefinition: ri.ReleaseDefinition = await this.helper.getDefinition(targetProject.name, Number(parameters.definitionId));

        console.log(`Starting <${targetProject.name}> project ${ReleaseType[parameters.releaseType].toLowerCase()} <${targetDefinition.name}> release deployment`);

        let targetRelease: ri.Release;

        // Get target release
        switch (parameters.releaseType) {

            case ReleaseType.Create: {

                // Create new
                targetRelease = await this.helper.createRelease(targetProject, targetDefinition, details, parameters.stages, parameters.artifact);

                break;

            }

            case ReleaseType.Specific: {

                // Use existing
                targetRelease = await this.helper.getRelease(targetProject, Number(parameters.releaseId), parameters.stages);

                break;

            }

            case ReleaseType.Latest: {

                targetRelease = await this.helper.findRelease(targetProject.name, targetDefinition.id, parameters.stages, parameters.sourceBranch, parameters.releaseTag);

                break;

            }

            default: {

                throw new Error(`Unable to get or create release`);

            }

        }
        
        // Get target stages
        const targetStages = parameters.stages ? parameters.stages : targetRelease.environments.map((i) => i.name);

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
    
    private getReleaseParameters(project: ci.TeamProject, release: ri.Release, stages: string[], sleep: number): IReleaseParameters {

        return {

            projectName: project.name,
            releaseId: release.id,
            releaseStages: stages,
            sleep: sleep

        } as IReleaseParameters

    }

}
