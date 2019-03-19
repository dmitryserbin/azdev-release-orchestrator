import Table from "cli-table";
import Moment from "moment";

import * as ra from "azure-devops-node-api/ReleaseApi";
import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseParameters, IStageApproval, IApproveParameters, IDeployer, ReleaseStatus, IReleaseDetails } from "./interfaces";
import { ReleaseProgress } from "./common";

export class Deployer implements IDeployer {

    private releaseApi: ra.IReleaseApi;

    constructor(releaseApi: ra.IReleaseApi) {

        this.releaseApi = releaseApi;

    }

    async deployManual(parameters: IReleaseParameters, releaseDetails: IReleaseDetails): Promise<void> {

        // Initialize progress
        const releaseProgress: ReleaseProgress = new ReleaseProgress(parameters.releaseStages);

        try {

            // Deploy stages sequentially
            for (const stage of releaseProgress.getPendingStages()) {

                const releaseStatus = await this.getReleaseStatus(parameters.projectName, parameters.releaseId);
                releaseProgress.url = releaseStatus._links.web.href;

                // Get release stage
                let releaseStage: any = releaseStatus.environments!.find((i: ri.ReleaseEnvironment) => i.name === stage.name);

                console.log(`Deploying <${releaseStage.name}> release stage (last status <${ri.EnvironmentStatus[releaseStage.status]}>)`);

                stage.id = releaseStage.id;
                stage.release = releaseStage.release.name;
                stage.status = releaseStage.status;

                // Start stage deployment process
                // Or skip if stage is in progress
                if (stage.isPending()) {

                    console.log(`Manually starting <${releaseStage.name}> (${releaseStage.id}) stage deployment`);

                    try {

                        // Start stage deployment
                        releaseStage = await this.releaseApi.updateReleaseEnvironment({

                            status: ri.EnvironmentStatus.InProgress,
                            comment: `Requested via ${releaseDetails.releaseName} (${releaseDetails.projectName}) by ${releaseDetails.requesterName}`,

                        } as ri.ReleaseEnvironmentUpdateMetadata, parameters.projectName, parameters.releaseId, releaseStage.id);

                    } catch (e) {

                        throw new Error(`Unable to update release stage status. ${e}`);

                    }

                    stage.status = releaseStage.status;

                }

                // Monitor stage progress
                do {

                    const releaseStatus = await this.getReleaseStatus(parameters.projectName, parameters.releaseId);
                    const stageStatus = await this.getStageStatus(releaseStatus, stage.name);

                    const approveParameters = {

                        projectName: parameters.projectName,
                        status: stage.approval,
                        retry: 60,
                        sleep: 60000

                    } as IApproveParameters;

                    // Approve stage deployment and validate outcome
                    // Use retry mechanism to check manual approval status
                    // Cancel stage deployment when retry count exceeded
                    stage.approval = await this.approveStage(stageStatus, approveParameters, releaseDetails);

                    stage.status = stageStatus.status as ri.EnvironmentStatus;

                    // Display status
                    if (stage.isCompleted()) {

                        await this.displayStatus(stageStatus);

                        break;

                    }

                    await this.delay(parameters.sleep);

                }
                while (true);

            }

            // Validate progress
            releaseProgress.validate();

        } catch (e) {

            throw e;

        } finally {

            releaseProgress.display();

        }

    }

    async deployAutomated(parameters: IReleaseParameters, releaseDetails: IReleaseDetails): Promise<void> {

        // Initialize progress
        const releaseProgress: ReleaseProgress = new ReleaseProgress(parameters.releaseStages);

        try {

            // Deploy stages simultaneously
            do {

                const releaseStatus = await this.getReleaseStatus(parameters.projectName, parameters.releaseId);
                releaseProgress.url = releaseStatus._links.web.href;

                for (const stage of releaseProgress.getIncompleted()) {

                    const stageStatus = await this.getStageStatus(releaseStatus, stage.name);

                    stage.id = stageStatus.id;
                    stage.release = stageStatus.release!.name;

                    const approveParameters = {

                        projectName: parameters.projectName,
                        status: stage.approval,
                        retry: 60,
                        sleep: 60000

                    } as IApproveParameters;

                    // Approve stage deployment and validate outcome
                    // Use retry mechanism to check manual approval status
                    // Cancel stage deployment when retry count exceeded
                    stage.approval = await this.approveStage(stageStatus, approveParameters, releaseDetails);

                    stage.status = stageStatus.status as ri.EnvironmentStatus;

                    // Display status
                    if (stage.isCompleted()) {

                        await this.displayStatus(stageStatus);

                        break;

                    }

                }

                await this.delay(parameters.sleep);
            }
            while (releaseProgress.getStatus() === ReleaseStatus.InProgress);

            // Validate progress
            releaseProgress.validate();

        } catch (e) {

            throw e;

        } finally {

            releaseProgress.display();

        }

    }

    async approveStage(stage: ri.ReleaseEnvironment, parameters: IApproveParameters, releaseDetails: IReleaseDetails): Promise<IStageApproval> {

        // Get pending approvals
        const pendingApprovals = stage.preDeployApprovals!.filter((i) => i.status === ri.ApprovalStatus.Pending);

        if (pendingApprovals.length > 0) {

            parameters.status.count++;

            console.log(`Approving <${stage.name}> (${stage.id}) stage deployment (retry ${parameters.status.count})`);

            // Approve pending requests in sequence
            // To support multiple approvals scenarios
            for (const request of pendingApprovals) {

                // Update status
                parameters.status.status = request.status!;

                // console.log(`id ${request.id} | type: ${request.approvalType} | approver: ${request.approver.displayName} | status: ${request.status}`);

                try {

                    // Approve
                    const requestStatus: ri.ReleaseApproval = await this.releaseApi.updateReleaseApproval({

                        status: ri.ApprovalStatus.Approved,
                        comments: `Approved by Azure DevOps release orchestrator`,

                    } as ri.ReleaseApproval, parameters.projectName, request.id!);

                    parameters.status.status = requestStatus.status!;

                    // Stop loop is approval succeeded
                    // No need to approve following request
                    if (requestStatus.status === ri.ApprovalStatus.Approved) {

                        console.log(`Stage <${stage.name}> (${stage.id}) deployment successfully approved`);

                        break;

                    }

                } catch {

                    parameters.status.status = ri.ApprovalStatus.Rejected;

                }
            }

            // Validate unsuccessful approval
            if (parameters.status.status === ri.ApprovalStatus.Rejected) {

                // Wait and retry approval
                if (parameters.status.count < parameters.retry) {

                    console.warn(`Stage <${stage.name}> (${stage.id}) cannot be approved by <${releaseDetails.releaseName}> (${releaseDetails.endpointName})`);

                    await this.delay(parameters.sleep);

                // Cancel stage deployment
                } else {

                    console.warn(`Stage <${stage.name}> (${stage.id}) approval waiting time limit exceeded`);

                    const releaseStage: ri.ReleaseEnvironment = await this.releaseApi.updateReleaseEnvironment({

                        status: ri.EnvironmentStatus.Canceled,
                        comment: "Approval waiting time limit exceeded",

                    } as ri.ReleaseEnvironmentUpdateMetadata, parameters.projectName, stage.release!.id!, stage.id!);

                }

            }

        }

        return parameters.status;
        
    }

    async getReleaseStatus(projectName: string, releaseId: number, retry: number = 10, timeout: number = 5000): Promise<ri.Release> {

        let progress: ri.Release | undefined;
        let retryAttempt: number = 0;

        // Retry mechanism to address intermittent ECONNRESET errors
        // https://github.com/Microsoft/azure-devops-node-api/issues/292
        while (retryAttempt < retry) {

            try {

                retryAttempt++;

                // Get release status
                progress = await this.releaseApi.getRelease(projectName, releaseId);

                // Stop retrying on success
                retryAttempt = retry;

            } catch {

                console.log(`Retry retrieving release status..`);

                // Delay before next retry
                await this.delay(timeout);

            }

        }

        if (!progress) {

            throw new Error(`Unable to get ${releaseId} release progress`);

        }

        return progress;

    }

    private async getStageStatus(releaseStatus: ri.Release, stageName: string): Promise<ri.ReleaseEnvironment> {

        const progress = releaseStatus.environments!.find((i) => i.name === stageName);

        if (!progress) {

            throw new Error(`Unable to get ${stageName} stage progress`);

        }

        return progress;

    }

    private async displayStatus(stage: ri.ReleaseEnvironment): Promise<void> {

        console.log(`Stage <${stage.name}> (${stage.id}) deployment completed with <${ri.EnvironmentStatus[stage.status!]}> status`);

        // Get latest deployment attempt
        const deploymentAttempt: ri.DeploymentAttempt = stage.deploySteps!.sort((left, right) => left.deploymentId! - right.deploymentId!).reverse()[0];

        for (const phase of deploymentAttempt.releaseDeployPhases!) {

            console.log(`Phase <${phase.name}> completed with <${ri.DeployPhaseStatus[phase.status!]}> status`);

            for (const job of phase.deploymentJobs!) {

                const table = new Table({ head: ["Agent", "Task", "Status", "Duration"] });

                for (const task of job.tasks!) {

                    table.push([

                        task.agentName ? task.agentName : "-",
                        task.name ? task.name : "-",
                        task.status? ri.TaskStatus[task.status] : "-",
                        task.startTime && task.finishTime ? Moment.duration(new Date(task.startTime).getTime() - new Date (task.finishTime).getTime()).humanize() : "-",

                    ]);

                }

                console.log(table.toString());

            }

        }

    }

    private async delay(ms: number) {

        return new Promise((resolve) => setTimeout(resolve, ms));
    
    }

}
