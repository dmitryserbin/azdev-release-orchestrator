import Table from "cli-table";
import Debug from "debug";

import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IReleaseProgress, IStageApproval, IStageProgress, ReleaseStatus } from "./interfaces";

const logger = Debug("release-orchestrator");

export class StageProgress implements IStageProgress {

    constructor(
        public name: string,
        public approval: IStageApproval,
        public status: ri.EnvironmentStatus,
        public id?: number,
        public release?: string) { }

    // Stage pending
    public isPending(): boolean {

        const verbose = logger.extend("StageProgress:isPending");

        const status: boolean = (this.status !== ri.EnvironmentStatus.Queued &&
            this.status !== ri.EnvironmentStatus.InProgress);

        verbose(status);

        return status;

    }

    // Stage completed
    public isCompleted(): boolean {

        const verbose = logger.extend("StageProgress:isCompleted");

        const status: boolean = (this.status === ri.EnvironmentStatus.Succeeded ||
            this.status === ri.EnvironmentStatus.PartiallySucceeded ||
            this.status === ri.EnvironmentStatus.Rejected ||
            this.status === ri.EnvironmentStatus.Canceled);

        verbose(status);

        return status;

    }

}

export class ReleaseProgress implements IReleaseProgress {

    public progress: IStageProgress[] = new Array<IStageProgress>();
    public url?: string;

    constructor(stages: string[], url?: string) {

        for (const stage of stages) {

            const approval = {

                status: ri.ApprovalStatus.Undefined,
                count: 0,

            } as IStageApproval;

            this.progress.push(new StageProgress(stage, approval, ri.EnvironmentStatus.NotStarted));

        }

    }

    // Get pending stages
    public getPendingStages(): IStageProgress[] {

        const verbose = logger.extend("ReleaseProgress:getPendingStages");

        const result: IStageProgress[] = this.progress.filter((i) => i.isPending());

        verbose(result);

        return result;

    }

    // Get incomplited stages
    public getIncompleted(): IStageProgress[] {

        const verbose = logger.extend("ReleaseProgress:getIncompleted");

        const result: IStageProgress[] = this.progress.filter((i) => !i.isCompleted());

        verbose(result);

        return result;

    }

    // Get release status
    public getStatus(): ReleaseStatus {

        const verbose = logger.extend("ReleaseProgress:getStatus");

        let result: ReleaseStatus = ReleaseStatus.Undefined;

        // Get stages completion status
        const completed: boolean = this.progress.filter((i) => i.isCompleted()).length === this.progress.length;

        if (completed) {

            verbose(`All release stages completed`);

            // Get rejected or canceled stages
            const failed: boolean = this.progress.filter((i) =>
                i.status === ri.EnvironmentStatus.Rejected || i.status === ri.EnvironmentStatus.Canceled).length > 0;

            if (failed) {

                result = ReleaseStatus.Failed;

            } else {

                result = ReleaseStatus.Succeeded;

            }

        } else {

            verbose(`Some release stages in progress`);

            result = ReleaseStatus.InProgress;

        }

        verbose(`Release ${ReleaseStatus[result]} status`);

        return result;

    }

    // Validate progress
    public validate(): void {

        if (this.getStatus() === ReleaseStatus.Succeeded) {

            console.log(`All release stages deployment completed`);

        } else if (this.getStatus() === ReleaseStatus.Failed) {

            throw new Error(`One or more release stage(s) deployment failed`);
        }
    }

    // Display progress
    public display(): void {

        const table = new Table({ head: ["Release", "Stage", "Approval", "Status"] });

        for (const stage of this.progress) {

            table.push([

                stage.release ? stage.release : "-",
                stage.name ? stage.name : "-",
                stage.approval.status ? ri.ApprovalStatus[stage.approval.status] : "-",
                stage.status ? ri.EnvironmentStatus[stage.status] : "-",

            ]);

        }

        console.log(table.toString());

        if (this.url) {

            console.log(`Release <${this.url}> summary`);

        }

    }

}
