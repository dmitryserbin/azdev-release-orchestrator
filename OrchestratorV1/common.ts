import Table from "cli-table";

import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { ReleaseStatus, IStageProgress, IStageApproval, IReleaseProgress } from "./interfaces";

export class StageProgress implements IStageProgress {

    constructor(
        public name: string,
        public approval: IStageApproval,
        public status: ri.EnvironmentStatus,
        public id?: number,
        public release?: string) { }

    // Stage pending
    public isPending(): boolean {

        return (this.status !== ri.EnvironmentStatus.Queued &&
            this.status !== ri.EnvironmentStatus.InProgress);

    }

    // Stage completed
    public isCompleted(): boolean {

        return (this.status === ri.EnvironmentStatus.Succeeded ||
            this.status === ri.EnvironmentStatus.Rejected ||
            this.status === ri.EnvironmentStatus.Canceled);

    }

}

export class ReleaseProgress implements IReleaseProgress {

    public progress: IStageProgress[] = new Array<IStageProgress>();
    public url?: string;

    constructor(stages: string[], url?: string) {

        for (const stage of stages) {

            const approval = {

                status: ri.ApprovalStatus.Undefined,
                count: 0

            } as IStageApproval;

            this.progress.push(new StageProgress(stage, approval, ri.EnvironmentStatus.NotStarted));

        }

    }

    // Get pending stages
    public getPendingStages(): IStageProgress[] {

        return this.progress.filter((i) => i.isPending());

    }

    // Get incomplited stages
    public getIncompleted(): IStageProgress[] {

        return this.progress.filter((i) => !i.isCompleted());

    }

    // Get release status
    public getStatus(): ReleaseStatus {

        // All stages completed
        const completed: boolean = this.progress.filter((i) =>
            i.isCompleted()).length === this.progress.length;

        if (completed) {

            // Any rejected or canceled stages
            const failed: boolean = this.progress.filter((i) =>
                i.status === ri.EnvironmentStatus.Rejected || i.status === ri.EnvironmentStatus.Canceled).length > 0;

            if (failed) {

                // Failed
                return ReleaseStatus.Failed;

            } else {

                // Succeeded
                return ReleaseStatus.Succeeded;

            }

        } else {

            // In progress
            return ReleaseStatus.InProgress;

        }

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
