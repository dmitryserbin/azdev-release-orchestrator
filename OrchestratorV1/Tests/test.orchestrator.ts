import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import * as ci from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IParameters, IReleaseDetails, IOrchestrator, IHelper, IDeployer, ReleaseType } from "../interfaces";
import { Orchestrator } from "../orchestrator";

describe("Orchestrator", () => {

    const mockProject = {

        id: "My-Project-Id",
        name: "My-Project"

    } as ci.TeamProject;

    const mockDefinition = {

        id: 1,
        name: "My-Definition",

    } as ri.ReleaseDefinition;

    const mockRelease = {

        id: 1,
        name: "My-Release",

    } as ri.Release;

    const mockDetails = {

        projectName: "My-Orchestrator",
        releaseName: "My-Orchestrator-20180101-1",
        requesterName: "My-Requester",
        requesterId: "15b9b1f7-ae1b-47ec-81e2-7647c0f195dc",
        endpointName: "My-Endpoint",

    } as IReleaseDetails;

    const mockParameters = {

        projectId: "My-Project-Id",
        definitionId: "1",
        releaseId: "",
        releaseType: ReleaseType.Undefined,
        stages: [ "DEV", "TEST", "PROD" ],
        artifact: "",

    } as IParameters;

    let consoleLog = console.log;
    let helperMock = TypeMoq.Mock.ofType<IHelper>();
    let deployerMock = TypeMoq.Mock.ofType<IDeployer>();

    helperMock.setup(x => x.getProject(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(mockProject));
    helperMock.setup(x => x.getDefinition(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve(mockDefinition));
    helperMock.setup(x => x.createRelease(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(mockRelease));
    helperMock.setup(x => x.getRelease(TypeMoq.It.isAny(), TypeMoq.It.isAnyNumber(), TypeMoq.It.isAny())).returns(() => Promise.resolve(mockRelease));
    helperMock.setup(x => x.findRelease(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber(), TypeMoq.It.isAny(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(mockRelease));

    deployerMock.setup(x => x.deployAutomated(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve());
    deployerMock.setup(x => x.deployManual(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve());

    it("Should deploy new automated release", async () => {

        const parameters = mockParameters;
        parameters.releaseType = ReleaseType.Create;

        helperMock.setup(x => x.isAutomated(TypeMoq.It.isAny())).returns(() => Promise.resolve(true));

        // Run orchestrator
        const orchestrator: IOrchestrator = new Orchestrator(helperMock.target, deployerMock.target);

        // Hide console output
        console.log = function(){};

        await orchestrator.deployRelease(parameters, mockDetails);

        // Restore console output
        console.log = consoleLog;
        
    });

    it("Should deploy existing release", async () => {

        const parameters = mockParameters;
        parameters.releaseId = "1";
        parameters.releaseType = ReleaseType.Specific;

        // Run orchestrator
        const orchestrator: IOrchestrator = new Orchestrator(helperMock.target, deployerMock.target);

        // Hide console output
        console.log = function(){};

        await orchestrator.deployRelease(parameters, mockDetails);

        // Restore console output
        console.log = consoleLog;
        
    });

    it("Should deploy latest release", async () => {

        const parameters = mockParameters;
        parameters.releaseType = ReleaseType.Latest;

        // Run orchestrator
        const orchestrator: IOrchestrator = new Orchestrator(helperMock.target, deployerMock.target);

        // Hide console output
        console.log = function(){};

        await orchestrator.deployRelease(parameters, mockDetails);

        // Restore console output
        console.log = consoleLog;
        
    });

});
