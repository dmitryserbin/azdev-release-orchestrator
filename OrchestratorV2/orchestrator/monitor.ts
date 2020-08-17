import { ApprovalStatus, EnvironmentStatus, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

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

            const approvalStatus: IStageApproval = {

                status: ApprovalStatus.Pending,
                count: 0,

            };

            const stageProgress: IStageProgress = {

                name: stage,
                approval: approvalStatus,
                status: EnvironmentStatus.NotStarted
            }

            releaseProgress.stages.push(stageProgress);

        }

        debug(releaseProgress);

        return releaseProgress;

    }

    public getActiveStages(releaseProgress: IReleaseProgress): IStageProgress[] {

        const debug = this.debugLogger.extend(this.getActiveStages.name);

        const incompletedStages: IStageProgress[] = releaseProgress.stages.filter((stage) => !this.isStageCompleted(stage));

        debug(incompletedStages);

        return incompletedStages;

    }

    public isStageCompleted(stageProgress: IStageProgress): boolean {

        const debug = this.debugLogger.extend(this.isStageCompleted.name);

        const status: boolean =
            stageProgress.status === EnvironmentStatus.Succeeded ||
            stageProgress.status === EnvironmentStatus.PartiallySucceeded ||
            stageProgress.status === EnvironmentStatus.Rejected ||
            stageProgress.status === EnvironmentStatus.Canceled;

        debug(stageProgress);

        return status;

    }

    public updateStageProgress(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment): void {

        stageProgress.id = stageStatus.id;
        stageProgress.release = stageStatus.release!.name;
        stageProgress.status = stageStatus.status!;
        stageProgress.duration = stageStatus.timeToDeploy?.toLocaleString();

    }

    public updateReleaseProgress(releaseProgress: IReleaseProgress): void {

        const debug = this.debugLogger.extend(this.updateReleaseProgress.name);

        // Get stages completion status
        const completed: boolean = releaseProgress.stages.filter((i) =>
            this.isStageCompleted(i)).length === releaseProgress.stages.length;

        if (completed) {

            debug(`All release stages completed`);

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

            debug(`Some release stages in progress`);

            releaseProgress.status = ReleaseStatus.InProgress;

        }

        debug(`Release status <${ReleaseStatus[releaseProgress.status]}> updated`);

    }

}
