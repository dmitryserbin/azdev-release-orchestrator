import "mocha";

import * as chai from "chai";

import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { ReleaseProgress, StageProgress } from "../common";
import { IStageApproval } from "../interfaces";

describe("StageProgress", () => {

    it("Should create stage progress", () => {

        const approval = {

            status: ri.ApprovalStatus.Undefined,
            count: 0,

        } as IStageApproval;

        const underTest: StageProgress = new StageProgress("My-Stage", approval, ri.EnvironmentStatus.NotStarted);

        chai.expect(underTest).to.not.eq(null);

    });

    it("Should get pending status", () => {

        const approval = {

            status: ri.ApprovalStatus.Undefined,
            count: 0,

        } as IStageApproval;

        const underTest: StageProgress = new StageProgress("My-Stage", approval, ri.EnvironmentStatus.NotStarted);

        Object.keys(ri.EnvironmentStatus).filter((key) => isNaN(Number(key))).forEach((key) => {

            underTest.status = (ri.EnvironmentStatus as any)[key];

            if (underTest.status !== ri.EnvironmentStatus.Queued &&
                underTest.status !== ri.EnvironmentStatus.InProgress) {

                chai.expect(underTest.isPending()).to.eq(true);

            } else {

                chai.expect(underTest.isPending()).to.eq(false);

            }

        });

    });

    it("Should get completed status", () => {

        const approval = {

            status: ri.ApprovalStatus.Undefined,
            count: 0,

        } as IStageApproval;

        const underTest: StageProgress = new StageProgress("My-Stage", approval, ri.EnvironmentStatus.NotStarted);

        Object.keys(ri.EnvironmentStatus).filter((key) => isNaN(Number(key))).forEach((key) => {

            underTest.status = (ri.EnvironmentStatus as any)[key];

            if (underTest.status === ri.EnvironmentStatus.Succeeded ||
                underTest.status === ri.EnvironmentStatus.PartiallySucceeded ||
                underTest.status === ri.EnvironmentStatus.Rejected ||
                underTest.status === ri.EnvironmentStatus.Canceled) {

                chai.expect(underTest.isCompleted()).to.eq(true);

            } else {

                chai.expect(underTest.isCompleted()).to.eq(false);

            }

        });

    });

});

describe("ReleaseProgress", () => {

    const mockStages = [ "DEV", "TEST", "PROD" ];

    it("Should create release progress", () => {

        const underTest: ReleaseProgress = new ReleaseProgress(mockStages);

        chai.expect(underTest).to.not.eq(null);

    });

    it("Should get <Pending> release stages", () => {

        const underTest: ReleaseProgress = new ReleaseProgress(mockStages);

        chai.expect(underTest.getPendingStages().length).eq(3);

    });

    it("Should get <Incompleted> release stages", () => {

        const underTest: ReleaseProgress = new ReleaseProgress(mockStages);

        chai.expect(underTest.getIncompleted().length).eq(3);

    });

});
