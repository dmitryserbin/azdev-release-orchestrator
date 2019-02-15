import "mocha";

import * as chai from "chai";

import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IStageApproval } from "../interfaces";
import { StageProgress, ReleaseProgress } from "../common";

describe("StageProgress", () => {

    it("Should create stage progress", () => {

        const approval = {

            status: ri.ApprovalStatus.Undefined,
            count: 0

        } as IStageApproval;

        const underTest: StageProgress = new StageProgress("My-Stage", approval, ri.EnvironmentStatus.NotStarted);
        
        chai.expect(underTest).not.null;

    });

    it("Should get pending status", () => {

        const approval = {

            status: ri.ApprovalStatus.Undefined,
            count: 0

        } as IStageApproval;

        const underTest: StageProgress = new StageProgress("My-Stage", approval, ri.EnvironmentStatus.NotStarted);
        
        Object.keys(ri.EnvironmentStatus).filter(key => isNaN(Number(key))).forEach(key => {

            underTest.status = (<any>ri.EnvironmentStatus)[key];

            if (underTest.status !== ri.EnvironmentStatus.Queued &&
                underTest.status !== ri.EnvironmentStatus.InProgress) {

                chai.expect(underTest.isPending()).true;

            } else {

                chai.expect(underTest.isPending()).false;

            };

        });

    });

    it("Should get completed status", () => {

        const approval = {

            status: ri.ApprovalStatus.Undefined,
            count: 0

        } as IStageApproval;

        const underTest: StageProgress = new StageProgress("My-Stage", approval, ri.EnvironmentStatus.NotStarted);
        
        Object.keys(ri.EnvironmentStatus).filter(key => isNaN(Number(key))).forEach(key => {

            underTest.status = (<any>ri.EnvironmentStatus)[key];

            if (underTest.status === ri.EnvironmentStatus.Succeeded ||
                underTest.status === ri.EnvironmentStatus.Rejected ||
                underTest.status === ri.EnvironmentStatus.Canceled) {

                chai.expect(underTest.isCompleted()).true;

            } else {

                chai.expect(underTest.isCompleted()).false;

            };

        });

    });

});

describe("ReleaseProgress", () => {

    let mockStages = [ "DEV", "TEST", "PROD" ];

    it("Should create release progress", () => {

        const underTest: ReleaseProgress = new ReleaseProgress(mockStages);

        chai.expect(underTest).not.null;

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
