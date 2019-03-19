import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import * as az from "azure-devops-node-api";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";
import * as ba from "azure-devops-node-api/BuildApi";
import * as ci from "azure-devops-node-api/interfaces/CoreInterfaces";
import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import * as bi from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IHelper, IReleaseDetails, IReleaseFilter } from "../interfaces";
import { Helper } from "../helper";

describe("Helper", () => {

    const endpointName = "My-Endpoint";
    const sourceProjectName = "My-Orchestrator-Project";
    const sourceReleaseName = "My-Orchestrator-Release";
    const requesterName = "My-Name";
    const requesterId = "1";
    
    const projectName = "My-Project";
    const projectId = "My-Project-Id";

    const definitionId = 1;
    const definitionName = "My-Definition";

    const releasetId = 1;
    const releaseName = "My-Release";
    const releaseStages = [ "DEV", "TEST", "PROD" ];
    const releaseEnvironments = [
        {
            id: 1,
            name: "DEV",
            conditions: [] as ri.ReleaseCondition[]
        },
        {
            id: 2,
            name: "TEST",
            conditions: [] as ri.ReleaseCondition[]
        },
        {
            id: 3,
            name: "PROD",
            conditions: [] as ri.ReleaseCondition[]
        }
    ];

    const buildId = 1;
    const buildNumber = "My-Build-01";
    const buildDefinitionId = 1;

    let webApiMock = TypeMoq.Mock.ofType<az.WebApi>();
    let coreApiMock = TypeMoq.Mock.ofType<ca.ICoreApi>();
    let releaseApiMock = TypeMoq.Mock.ofType<ra.IReleaseApi>();
    let buildApiMock = TypeMoq.Mock.ofType<ba.IBuildApi>();

    it("Should get project", async () => {

        coreApiMock.setup(x => x.getProject(TypeMoq.It.isAnyString())).returns(() => Promise.resolve({ id: projectId} as ci.TeamProject));
        webApiMock.setup(x => x.getCoreApi()).returns(() => Promise.resolve(coreApiMock.target));

        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.getProject(projectId);

        chai.expect(result).not.null;
        chai.expect(result.id).eq(projectId);
        
    });
    
    it("Should get definition", async () => {

        const definitionMock = {

            id: definitionId,
            name: definitionName,

        } as ri.ReleaseDefinition;

        releaseApiMock.setup(x => x.getReleaseDefinition(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve(definitionMock as ri.ReleaseDefinition));
        webApiMock.setup(x => x.getReleaseApi()).returns(() => Promise.resolve(releaseApiMock.target));

        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.getDefinition(projectName, definitionId);

        chai.expect(result).not.null;
        chai.expect(result.id).eq(definitionId);
        chai.expect(result.name).eq(definitionName);

    });

    it("Should get release", async () => {

        const projectMock = {
            
            name: projectName
        
        } as ci.TeamProject;

        const releaseMock = {

            id: releasetId,
            name: releaseName,
            environments: releaseEnvironments
        
        } as ri.Release;

        releaseApiMock.setup(x => x.getRelease(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve(releaseMock as ri.Release));
        webApiMock.setup(x => x.getReleaseApi()).returns(() => Promise.resolve(releaseApiMock.target));

        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.getRelease(projectMock, releasetId, releaseStages);

        chai.expect(result).not.null;
        chai.expect(result.id).eq(releasetId);
        chai.expect(result.name).eq(releaseName);

    });

    it("Should create release", async () => {

        const projectMock = {
            
            name: projectName
        
        } as ci.TeamProject;

        const definitionMock = {

            id: definitionId,
            name: definitionName,

        } as ri.ReleaseDefinition;

        const releaseMock = {

            id: releasetId,
            name: releaseName,
            environments: releaseEnvironments
        
        } as ri.Release;

        const detailsMock = {

            endpointName: endpointName,
            projectName: sourceProjectName,
            releaseName: sourceReleaseName,
            requesterName: requesterName,
            requesterId: requesterId,

        } as IReleaseDetails;

        releaseApiMock.setup(x => x.createRelease(TypeMoq.It.isAny(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve(releaseMock as ri.Release));
        webApiMock.setup(x => x.getReleaseApi()).returns(() => Promise.resolve(releaseApiMock.target));

        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.createRelease(projectMock, definitionMock, detailsMock);

        chai.expect(result).not.null;
        chai.expect(result.id).eq(releasetId);
        chai.expect(result.name).eq(releaseName);

    });

    it("Should find latest release", async () => {

        const projectMock = {
            
            name: projectName
        
        } as ci.TeamProject;

        const releaseMock = {

            id: releasetId,
            name: releaseName,
            environments: releaseEnvironments
        
        } as ri.Release;

        const filtersMock = {
            
            artifactVersion: undefined,
            sourceBranch: undefined,
            tag: undefined,

        } as IReleaseFilter;

        releaseApiMock.setup(x => x.getRelease(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve(releaseMock as ri.Release));
        releaseApiMock.setup(x => x.getReleases(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve([ releaseMock ] as ri.Release[]));
        webApiMock.setup(x => x.getReleaseApi()).returns(() => Promise.resolve(releaseApiMock.target));
        
        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.findRelease(projectMock.name!, definitionId, releaseStages, filtersMock);

        chai.expect(result).not.null;
        chai.expect(result.id).eq(releasetId);
        chai.expect(result.name).eq(releaseName);

    });

    it("Should find release matching tag filter", async () => {

        let tagFilter = "my-test-release";

        const projectMock = {
            
            name: projectName
        
        } as ci.TeamProject;

        const releaseMock = {

            id: releasetId,
            name: releaseName,
            environments: releaseEnvironments,
            tags: [ tagFilter ]
        
        } as ri.Release;

        const filtersMock = {
            
            artifactVersion: undefined,
            sourceBranch: undefined,
            tag: [ tagFilter ],

        } as IReleaseFilter;

        releaseApiMock.setup(x => x.getRelease(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve(releaseMock as ri.Release));
        releaseApiMock.setup(x => x.getReleases(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve([ releaseMock ] as ri.Release[]));
        webApiMock.setup(x => x.getReleaseApi()).returns(() => Promise.resolve(releaseApiMock.target));
        
        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.findRelease(projectMock.name!, definitionId, releaseStages, filtersMock);

        chai.expect(result).not.null;
        chai.expect(result.id).eq(releasetId);
        chai.expect(result.name).eq(releaseName);
        chai.expect(result.tags).contains(tagFilter);

    });

    it("Should find release matching branch filter", async () => {

        let sourceFilter = "my-test-branch";

        const projectMock = {
            
            name: projectName
        
        } as ci.TeamProject;

        const artifactMock = {

            alias: "My-Artifact",
            isPrimary: true,
            definitionReference: {

                branch: {
                    
                    id: "1",
                    name: `refs/heads/${sourceFilter}`,

                }
            },
            sourceId: "My-Source-Id",
            type: "My-Type"

        } as ri.Artifact;

        const releaseMock = {

            id: releasetId,
            name: releaseName,
            environments: releaseEnvironments,
            artifacts: [ artifactMock ],
        
        } as ri.Release;

        const filtersMock = {
            
            artifactVersion: undefined,
            sourceBranch: `refs/heads/${sourceFilter}`,
            tag: undefined,

        } as IReleaseFilter;

        releaseApiMock.setup(x => x.getRelease(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve(releaseMock as ri.Release));
        releaseApiMock.setup(x => x.getReleases(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyNumber(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve([ releaseMock ] as ri.Release[]));
        webApiMock.setup(x => x.getReleaseApi()).returns(() => Promise.resolve(releaseApiMock.target));
        
        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.findRelease(projectMock.name!, definitionId, releaseStages, filtersMock);

        chai.expect(result).not.null;
        chai.expect(result.id).eq(releasetId);
        chai.expect(result.name).eq(releaseName);
        chai.expect(result.artifacts).not.null;
        chai.expect(result.artifacts).length.gt(0);
        chai.expect(result.artifacts![0].definitionReference).not.null;
        chai.expect(result.artifacts![0].definitionReference!.branch.name).eq(`refs/heads/${sourceFilter}`)

    });

    it("Should find latest build", async () => {

        const projectMock = {
            
            name: projectName,
        
        } as ci.TeamProject;

        const buildMock = {

            id: buildId,
            buildNumber: buildNumber,
        
        } as bi.Build;

        buildApiMock.setup(x => x.getBuilds(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve([ buildMock ] as bi.Build[]));
        webApiMock.setup(x => x.getBuildApi()).returns(() => Promise.resolve(buildApiMock.target));
        
        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.findBuild(projectMock.name!, buildDefinitionId);

        chai.expect(result).not.null;
        chai.expect(result.id).eq(buildId);
        chai.expect(result.buildNumber).eq(buildNumber);

    });

    it("Should find latest build matching tag filter", async () => {

        let tagFilter = "my-build-tag";

        const projectMock = {
            
            name: projectName,
        
        } as ci.TeamProject;

        const buildMock = {

            id: buildId,
            buildNumber: buildNumber,
            tags: [ tagFilter ],
        
        } as bi.Build;

        buildApiMock.setup(x => x.getBuilds(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve([ buildMock ] as bi.Build[]));
        webApiMock.setup(x => x.getBuildApi()).returns(() => Promise.resolve(buildApiMock.target));
        
        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.findBuild(projectMock.name!, buildDefinitionId, [ tagFilter ]);

        chai.expect(result).not.null;
        chai.expect(result.id).eq(buildId);
        chai.expect(result.buildNumber).eq(buildNumber);
        chai.expect(result.tags).contains(tagFilter);

    });

    it("Should get manual release status", async () => {

        const releaseMock = {

            id: releasetId,
            name: releaseName,
            environments: releaseEnvironments
        
        } as ri.Release;

        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.isAutomated(releaseMock);

        chai.expect(result).not.null;
        chai.expect(result).is.false;

    });

    it("Should get automated release status", async () => {

        let targetEnvironments = releaseEnvironments;

        // Update release conditions
        targetEnvironments[0].conditions = [ { result: true } as ri.ReleaseCondition ];

        const releaseMock = {

            id: releasetId,
            name: releaseName,
            environments: targetEnvironments
        
        } as ri.Release;

        const helper: IHelper = new Helper(coreApiMock.target, releaseApiMock.target, buildApiMock.target);
        const result = await helper.isAutomated(releaseMock);

        chai.expect(result).not.null;
        chai.expect(result).is.true;

    });

});
