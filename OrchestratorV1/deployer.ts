import Table from "cli-table";
import Debug from "debug";
import Moment from "moment";

import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { ReleaseProgress } from "./common";
import { IApproveParameters, IDeployer, IHelper, IReleaseDetails, IReleaseParameters, IStageApproval, ReleaseStatus } from "./interfaces";

const logger = Debug("release-orchestrator:Deployer");

export class Deployer implements IDeployer {

    private helper: IHelper;

    constructor(helper: IHelper) {

        this.helper = helper;

    }

    public async deployManual(parameters: IReleaseParameters, releaseDetails: IReleaseDetails): Promise<void> {

        const verbose = logger.extend("deployManual");

        // Initialize progress
        const releaseProgress: ReleaseProgress = new ReleaseProgress(parameters.releaseStages);

        verbose(releaseProgress);

        try {

            // Deploy stages sequentially
            for (const stage of releaseProgress.getPendingStages()) {

                let releaseStatus = await this.helper.getReleaseStatus(parameters.projectName, parameters.releaseId);
                releaseProgress.url = releaseStatus._links.web.href;

                // Get stage status
                let releaseStage: ri.ReleaseEnvironment = await this.helper.getStageStatus(releaseStatus, stage.name);

                console.log(`Deploying <${releaseStage.name}> release stage (last status <${ri.EnvironmentStatus[releaseStage.status!]}>)`);

                stage.id = releaseStage.id;
                stage.release = releaseStage.release!.name;
                stage.status = releaseStage.status!;

                // Start stage deployment process
                // Or skip if stage is in progress
                if (stage.isPending()) {

                    console.log(`Manually starting <${releaseStage.name}> (${releaseStage.id}) stage deployment`);

                    try {

                        const stageStatus: ri.ReleaseEnvironmentUpdateMetadata = {

                            status: ri.EnvironmentStatus.InProgress,
                            comment: `Requested via ${releaseDetails.releaseName} (${releaseDetails.projectName}) by ${releaseDetails.requesterName}`,

                        };

                        verbose(stageStatus);

                        // Start stage deployment
                        releaseStage = await this.helper.updateStage(stageStatus, parameters.projectName, parameters.releaseId, releaseStage.id!);

                    } catch (e) {

                        throw new Error(`Unable to update release stage status. ${e}`);

                    }

                    stage.status = releaseStage.status!;

                }

                // Monitor stage progress
                do {

                    releaseStatus = await this.helper.getReleaseStatus(parameters.projectName, parameters.releaseId);
                    const stageStatus = await this.helper.getStageStatus(releaseStatus, stage.name);

                    const approveParameters = {

                        projectName: parameters.projectName,
                        status: stage.approval,
                        retry: 60,
                        sleep: 60000,

                    } as IApproveParameters;

                    // Approve stage deployment and validate outcome
                    // Use retry mechanism to check manual approval status
                    // Cancel stage deployment when retry count exceeded
                    stage.approval = await this.approveStage(stageStatus, approveParameters, releaseDetails);

                    stage.status = stageStatus.status as ri.EnvironmentStatus;

                    // Display status
                    if (stage.isCompleted()) {

                        await this.displayStageProgress(stageStatus);

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

    public async deployAutomated(parameters: IReleaseParameters, releaseDetails: IReleaseDetails): Promise<void> {

        const verbose = logger.extend("deployAutomated");

        // Initialize progress
        const releaseProgress: ReleaseProgress = new ReleaseProgress(parameters.releaseStages);

        verbose(releaseProgress);

        try {

            // Deploy stages simultaneously
            do {

                const releaseStatus = await this.helper.getReleaseStatus(parameters.projectName, parameters.releaseId);
                releaseProgress.url = releaseStatus._links.web.href;

                for (const stage of releaseProgress.getIncompleted()) {

                    const stageStatus = await this.helper.getStageStatus(releaseStatus, stage.name);

                    stage.id = stageStatus.id;
                    stage.release = stageStatus.release!.name;

                    const approveParameters = {

                        projectName: parameters.projectName,
                        status: stage.approval,
                        retry: 60,
                        sleep: 60000,

                    } as IApproveParameters;

                    // Approve stage deployment and validate outcome
                    // Use retry mechanism to check manual approval status
                    // Cancel stage deployment when retry count exceeded
                    stage.approval = await this.approveStage(stageStatus, approveParameters, releaseDetails);

                    stage.status = stageStatus.status as ri.EnvironmentStatus;

                    // Display status
                    if (stage.isCompleted()) {

                        await this.displayStageProgress(stageStatus);

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

    public async approveStage(stage: ri.ReleaseEnvironment, parameters: IApproveParameters, releaseDetails: IReleaseDetails): Promise<IStageApproval> {

        const verbose = logger.extend("approveStage");

        // Get pending approvals
        const pendingApprovals = stage.preDeployApprovals!.filter((i) => i.status === ri.ApprovalStatus.Pending);

        if (pendingApprovals.length > 0) {

            parameters.status.count++;

            console.log(`Approving <${stage.name}> (${stage.id}) stage deployment (retry ${parameters.status.count})`);

            // Approve pending requests in sequence
            // To support multiple approvals scenarios
            for (const request of pendingApprovals) {

                verbose(request);

                // Update status
                parameters.status.status = request.status!;

                // console.log(`id ${request.id} | type: ${request.approvalType} | approver: ${request.approver.displayName} | status: ${request.status}`);

                try {

                    const releaseApproval: ri.ReleaseApproval = {

                        status: ri.ApprovalStatus.Approved,
                        comments: `Approved by Azure DevOps release orchestrator`,

                    };

                    // Approve
                    const requestStatus: ri.ReleaseApproval = await this.helper.updateApproval(releaseApproval, parameters.projectName, request.id!);

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

                    const stageSatus: ri.ReleaseEnvironmentUpdateMetadata = {

                        status: ri.EnvironmentStatus.Canceled,
                        comment: "Approval waiting time limit exceeded",

                    };

                    const releaseStage: ri.ReleaseEnvironment = await this.helper.updateStage(stageSatus, parameters.projectName, stage.release!.id!, stage.id!);

                    verbose(releaseStage);

                }

            }

        }

        verbose(`Stage ${stage.name} approval status ${ri.ApprovalStatus[parameters.status.status!]} retrieved`);

        return parameters.status;

    }

    private async displayStageProgress(stage: ri.ReleaseEnvironment): Promise<void> {

        const verbose = logger.extend("displayStageProgress");

        console.log(`Stage <${stage.name}> (${stage.id}) deployment completed with <${ri.EnvironmentStatus[stage.status!]}> status`);

        // Get latest deployment attempt
        const deploymentAttempt: ri.DeploymentAttempt = stage.deploySteps!.sort((left, right) => left.deploymentId! - right.deploymentId!).reverse()[0];

        verbose(deploymentAttempt);

        for (const phase of deploymentAttempt.releaseDeployPhases!) {

            console.log(`Phase <${phase.name}> completed with <${ri.DeployPhaseStatus[phase.status!]}> status`);

            for (const job of phase.deploymentJobs!) {

                const table = new Table({ head: ["Agent", "Task", "Status", "Duration"] });

                for (const task of job.tasks!) {

                    table.push([

                        task.agentName ? task.agentName : "-",
                        task.name ? task.name : "-",
                        task.status ? ri.TaskStatus[task.status] : "-",
                        task.startTime && task.finishTime ? Moment.duration(new Date(task.startTime).getTime() - new Date (task.finishTime).getTime()).humanize() : "-",

                    ]);

                }

                console.log(table.toString());

            }

        }

    }

    private async delay(ms: number) {

        const verbose = logger.extend("delay");

        verbose(`Start ${ms}ms delay`);

        return new Promise((resolve) => setTimeout(resolve, ms));

    }

}
