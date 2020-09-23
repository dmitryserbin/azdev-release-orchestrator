import { String } from "typescript-string-operations";

import { ApprovalStatus, EnvironmentStatus, ReleaseEnvironment, DeploymentAttempt } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IMonitor } from "../interfaces/orchestrator/monitor";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IDebugLogger } from "../interfaces/loggers/debuglogger";
import { IReleaseProgress } from "../interfaces/common/releaseprogress";
import { IStageApproval } from "../interfaces/common/stageapproval";
import { IStageProgress } from "../interfaces/common/stageprogress";
import { ReleaseStatus } from "../interfaces/common/releasestatus";
import { IReleaseJob } from "../interfaces/common/releasejob";

export class Monitor implements IMonitor {

    private debugLogger: IDebugLogger;

    constructor(debugCreator: IDebugCreator) {

        this.debugLogger = debugCreator.extend(this.constructor.name);

    }

    public createProgress(releaseJob: IReleaseJob): IReleaseProgress {

        const debug = this.debugLogger.extend(this.createProgress.name);

        const releaseUrl: string = `${releaseJob.project._links.web.href}/_release?releaseId=${releaseJob.release.id}`;

        const releaseProgress: IReleaseProgress = {

            id: releaseJob.release.id ? releaseJob.release.id : 0,
            name: releaseJob.release.name ? releaseJob.release.name : "-",
            project: releaseJob.project.name ? releaseJob.project.name : "-",
            url: releaseJob.project._links.web.href ? releaseUrl : "-",
            stages: [],
            status: ReleaseStatus.InProgress,

        };

        for (const stage of releaseJob.stages) {

            const releaseStage: ReleaseEnvironment = releaseJob.release.environments!.find(
                (i) => i.name === stage)!;

            if (!releaseStage) {

                throw new Error(`Release <${releaseJob.release.name}> stage <${stage}> not found`);

            }

            const approvalStatus: IStageApproval = {

                status: ApprovalStatus.Pending,
                retry: 0,

            };

            const stageProgress: IStageProgress = {

                name: stage,
                id: releaseStage.id,
                approval: approvalStatus,
                status: EnvironmentStatus.NotStarted
            }

            releaseProgress.stages.push(stageProgress);

        }

        debug(releaseProgress);

        return releaseProgress;

    }

    public updateReleaseProgress(releaseProgress: IReleaseProgress): void {

        const debug = this.debugLogger.extend(this.updateReleaseProgress.name);

        const completedStages: string[] = releaseProgress.stages.filter(
            (stage) => this.isStageCompleted(stage)).map(
                (stage) => stage.name);

        const activeStages: string[] = releaseProgress.stages.filter(
            (stage) => this.isStageActive(stage)).map(
                (stage) => stage.name);

        // Get stages completion status
        const completed: boolean = completedStages.length === releaseProgress.stages.length;

        if (completed) {

            debug(`All release stages <${String.Join("|", completedStages)}> completed`);

            // Get rejected or canceled stages
            const failed: boolean = releaseProgress.stages.filter((i) =>
                i.status === EnvironmentStatus.Rejected || i.status === EnvironmentStatus.Canceled).length > 0;

            if (failed) {

                releaseProgress.status = ReleaseStatus.Failed;

            } else {

                // Get partially succeeded stages
                const partiallySucceeded: boolean = releaseProgress.stages.filter((i) =>
                    i.status === EnvironmentStatus.PartiallySucceeded).length > 0;

                if (partiallySucceeded) {

                    releaseProgress.status = ReleaseStatus.PartiallySucceeded;

                } else {

                    releaseProgress.status = ReleaseStatus.Succeeded;

                }

            }

        } else {

            debug(`Release stages <${String.Join("|", activeStages)}> in progress`);

            releaseProgress.status = ReleaseStatus.InProgress;

        }

        debug(`Release status <${ReleaseStatus[releaseProgress.status]}> updated`);

    }

    public updateStageProgress(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment): void {

        // Get current deployment attempt
        const currentAttempt: DeploymentAttempt = stageStatus.deploySteps!.sort((left, right) =>
            left.deploymentId! - right.deploymentId!).reverse()[0];

        stageProgress.status = stageStatus.status!;
        stageProgress.id = stageStatus.id;
        stageProgress.release = stageStatus.release!.name;
        stageProgress.deployment = currentAttempt;
        stageProgress.duration = stageStatus.timeToDeploy!.toLocaleString();

    }

    public getActiveStages(releaseProgress: IReleaseProgress): IStageProgress[] {

        const debug = this.debugLogger.extend(this.getActiveStages.name);

        const activeStages: IStageProgress[] = releaseProgress.stages.filter(
            (stage) => !this.isStageCompleted(stage));

        debug(activeStages);

        return activeStages;

    }

    public getPendingStages(releaseProgress: IReleaseProgress): IStageProgress[] {

        const debug = this.debugLogger.extend(this.getPendingStages.name);

        const pendingStages: IStageProgress[] = releaseProgress.stages.filter(
            (stage) => this.isStagePending(stage));

        debug(pendingStages);

        return pendingStages;

    }

    public isStageCompleted(stageProgress: IStageProgress): boolean {

        const debug = this.debugLogger.extend(this.isStageCompleted.name);

        const status: boolean =
            stageProgress.status === EnvironmentStatus.Succeeded ||
            stageProgress.status === EnvironmentStatus.PartiallySucceeded ||
            stageProgress.status === EnvironmentStatus.Rejected ||
            stageProgress.status === EnvironmentStatus.Canceled;

        debug(`Stage <${stageProgress.name}> (${EnvironmentStatus[stageProgress.status]}) status <${status}>`);

        return status;

    }

    public isStageActive(stageProgress: IStageProgress): boolean {

        const debug = this.debugLogger.extend(this.isStageActive.name);

        const status: boolean =
            stageProgress.status !== EnvironmentStatus.Succeeded &&
            stageProgress.status !== EnvironmentStatus.PartiallySucceeded &&
            stageProgress.status !== EnvironmentStatus.Rejected &&
            stageProgress.status !== EnvironmentStatus.Canceled;

        debug(`Stage <${stageProgress.name}> (${EnvironmentStatus[stageProgress.status]}) status <${status}>`);

        return status;

    }

    public isStagePending(stageProgress: IStageProgress): boolean {

        const debug = this.debugLogger.extend(this.isStagePending.name);

        const status: boolean =
            stageProgress.status !== EnvironmentStatus.Queued &&
            stageProgress.status !== EnvironmentStatus.InProgress;

        debug(`Stage <${stageProgress.name}> (${EnvironmentStatus[stageProgress.status]}) status <${status}>`);

        return status;

    }

}
