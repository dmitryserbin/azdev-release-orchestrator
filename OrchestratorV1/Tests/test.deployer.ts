import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { Deployer } from "../deployer";
import { IApproveParameters, IDeployer, IHelper, IReleaseDetails, IStageApproval } from "../interfaces";

describe("Deployer", () => {

    const endpointName = "My-Endpoint";
    const sourceProjectName = "My-Orchestrator-Project";
    const sourceReleaseName = "My-Orchestrator-Release";
    const requesterName = "My-Name";
    const requesterId = "1";

    const projectName = "My-Project";
    const stageId = 1;
    const stageName = "DEV";

    const helperMock = TypeMoq.Mock.ofType<IHelper>();

    const consoleLog = console.log;

    it("Should skip stage approval", async () => {

        const preDeployApproval = {

            id: 1,
            status: ri.ApprovalStatus.Approved,

        } as ri.ReleaseApproval;

        const releaseStage = {

            id: stageId,
            name: stageName,
            preDeployApprovals: [ preDeployApproval ],

        } as ri.ReleaseEnvironment;

        const releaseDetails = {

            endpointName,
            projectName: sourceProjectName,
            releaseName: sourceReleaseName,
            requesterName,
            requesterId,

        } as IReleaseDetails;

        const approveParameters = {

            projectName,
            status: {

                status: ri.ApprovalStatus.Undefined,
                count: 0,

            } as IStageApproval,
            retry: 60,
            sleep: 60000,

        } as IApproveParameters;

        const deployer: IDeployer = new Deployer(helperMock.target);

        // Hide console output
        console.log = () => { /**/ };

        const result = await deployer.approveStage(releaseStage, approveParameters, releaseDetails);

        // Restore console output
        console.log = consoleLog;

        chai.expect(result).to.not.eq(null);
        chai.expect(result.status).eq(ri.ApprovalStatus.Undefined);
        chai.expect(result.count).eq(0);

    });

    it("Should approve pending stage", async () => {

        const preDeployApproval = {

            id: 1,
            status: ri.ApprovalStatus.Pending,

        } as ri.ReleaseApproval;

        const releaseStage = {

            id: stageId,
            name: stageName,
            preDeployApprovals: [ preDeployApproval ],

        } as ri.ReleaseEnvironment;

        const releaseDetails = {

            endpointName,
            projectName: sourceProjectName,
            releaseName: sourceReleaseName,
            requesterName,
            requesterId,

        } as IReleaseDetails;

        const approveParameters = {

            projectName,
            status: {

                status: ri.ApprovalStatus.Undefined,
                count: 0,

            } as IStageApproval,
            retry: 60,
            sleep: 60000,

        } as IApproveParameters;

        helperMock.setup((x) => x.updateApproval(TypeMoq.It.isAny(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve({

            status: ri.ApprovalStatus.Approved,

        } as ri.ReleaseApproval));

        const deployer: IDeployer = new Deployer(helperMock.target);

        // Hide console output
        console.log = () => { /**/ };

        const result = await deployer.approveStage(releaseStage, approveParameters, releaseDetails);

        // Restore console output
        console.log = consoleLog;

        chai.expect(result).to.not.eq(null);
        chai.expect(result.status).eq(ri.ApprovalStatus.Approved);
        chai.expect(result.count).eq(1);

    });

});
