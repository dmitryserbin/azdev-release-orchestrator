import Debug from "debug";

import { ApprovalStatus, EnvironmentStatus, Release, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IMonitor } from "../interfaces/orchestrator/monitor";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IReleaseProgress } from "../interfaces/orchestrator/releaseprogress";
import { IStageApproval } from "../interfaces/orchestrator/stageapproval";
import { IStageProgress } from "../interfaces/orchestrator/stageprogress";
import { ReleaseStatus } from "../interfaces/orchestrator/releasestatus";

export class Monitor implements IMonitor {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

    public createProgress(release: Release, stages: string[]): IReleaseProgress {

        const debug = this.debugLogger.extend(this.createProgress.name);

        const releaseProgress: IReleaseProgress = {

            name: release.name!,
            url: release._links.web.href,
            stages: [],
            status: ReleaseStatus.InProgress,

        };

        for (const stage of stages) {

            const approvalStatus: IStageApproval = {

                status: ApprovalStatus.Undefined,
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
