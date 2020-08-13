import Debug from "debug";

import { ApprovalStatus, EnvironmentStatus, Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IMonitor } from "../interfaces/orchestrator/monitor";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IReleaseProgress } from "../interfaces/orchestrator/releaseprogress";
import { IStageApproval } from "../interfaces/orchestrator/stageapproval";
import { IStageProgress } from "../interfaces/orchestrator/stageprogress";

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
            progress: [],

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

            releaseProgress.progress.push(stageProgress);

        }

        debug(releaseProgress);

        return releaseProgress;

    }

    public getActiveStages(releaseProgress: IReleaseProgress): IStageProgress[] {

        const debug = this.debugLogger.extend(this.getActiveStages.name);

        const incompletedStages: IStageProgress[] = releaseProgress.progress.filter((stage) => !this.isStageCompleted(stage));

        debug(incompletedStages);

        return incompletedStages;

    }

    private isStageCompleted(stageProgress: IStageProgress): boolean {

        const debug = this.debugLogger.extend(this.isStageCompleted.name);

        const status: boolean =
            stageProgress.status === EnvironmentStatus.Succeeded ||
            stageProgress.status === EnvironmentStatus.PartiallySucceeded ||
            stageProgress.status === EnvironmentStatus.Rejected ||
            stageProgress.status === EnvironmentStatus.Canceled;

        debug(stageProgress);

        return status;

    }

}
