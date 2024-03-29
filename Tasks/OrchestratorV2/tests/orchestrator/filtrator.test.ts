import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { Artifact, ArtifactMetadata, EnvironmentStatus, ReleaseDefinition, ReleaseStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IParameters } from "../../interfaces/task/iparameters";
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator";
import { IConsoleLogger } from "../../interfaces/loggers/iconsolelogger";
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger";
import { IBuildHelper } from "../../interfaces/helpers/ibuildhelper";
import { IReleaseHelper } from "../../interfaces/helpers/ireleasehelper";
import { IFilters } from "../../interfaces/task/ifilters";
import { ISettings } from "../../interfaces/common/isettings";
import { IFiltrator } from "../../interfaces/orchestrator/ifiltrator";
import { Filtrator } from "../../orchestrator/filtrator";

describe("Filtrator", () => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
    consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);

    const buildHelperMock = TypeMoq.Mock.ofType<IBuildHelper>();
    const releaseHelperMock = TypeMoq.Mock.ofType<IReleaseHelper>();

    const buildCount: number = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectReferenceMock: any = {

        name: "My-Project",
        id: "1",

    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const definitionReferenceMock: any = {

        name: "My-Definition",
        id: "1",

    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buildDefinitionReferenceMock: any = {

        definition: definitionReferenceMock,
        project: projectReferenceMock,

    };

    let projectMock: TypeMoq.IMock<TeamProject>;
    let definitionMock: TypeMoq.IMock<ReleaseDefinition>;
    let parametersMock: TypeMoq.IMock<IParameters>;
    let filtersMock: TypeMoq.IMock<IFilters>;
    let settingsMock: TypeMoq.IMock<ISettings>;

    const filterCreator: IFiltrator = new Filtrator(buildHelperMock.target, releaseHelperMock.target, debugCreatorMock.target);

    beforeEach(async () => {

        projectMock = TypeMoq.Mock.ofType<TeamProject>();
        definitionMock = TypeMoq.Mock.ofType<ReleaseDefinition>();
        parametersMock = TypeMoq.Mock.ofType<IParameters>();
        filtersMock = TypeMoq.Mock.ofType<IFilters>();
        settingsMock = TypeMoq.Mock.ofType<ISettings>();

        parametersMock.target.filters = filtersMock.target;
        parametersMock.target.settings = settingsMock.target;

        buildHelperMock.reset();
        releaseHelperMock.reset();

    });

    it("Should create artifact filter", async () => {

        //#region ARRANGE

        filtersMock.target.artifactVersion = "My-Build-01";
        filtersMock.target.artifactBranch = "My-Branch";
        filtersMock.target.artifactTags = [ "My-Tag-One", "My-Tag-Two" ];

        const artifactsMock = TypeMoq.Mock.ofType<ArtifactMetadata[]>();

        const primaryBuildArtifactMock = TypeMoq.Mock.ofType<Artifact>();
        primaryBuildArtifactMock.target.sourceId = "1";
        primaryBuildArtifactMock.target.definitionReference = buildDefinitionReferenceMock;

        const buildArtifactMock = TypeMoq.Mock.ofType<Build>();
        buildArtifactMock.target.id = 1;

        releaseHelperMock.setup((x) => x.getDefinitionPrimaryArtifact(definitionMock.target, "Build")).returns(
            () => Promise.resolve(primaryBuildArtifactMock.target));

        buildHelperMock.setup((x) => x.findBuild(primaryBuildArtifactMock.target.definitionReference!.project.name!, primaryBuildArtifactMock.target.definitionReference!.definition.name!, Number(primaryBuildArtifactMock.target.definitionReference!.definition.id!), filtersMock.target.artifactVersion, parametersMock.target.filters.artifactTags, buildCount)).returns(
            () => Promise.resolve(buildArtifactMock.target));

        releaseHelperMock.setup((x) => x.getArtifacts(projectMock.target.name!, definitionMock.target.id!, primaryBuildArtifactMock.target.sourceId!, buildArtifactMock.target.id!.toString(), parametersMock.target.filters.artifactBranch)).returns(
            () => Promise.resolve(artifactsMock.target));

        //#endregion

        //#region ACT

        const result = await filterCreator.createArtifactFilter(projectMock.target, definitionMock.target, parametersMock.target.filters);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

    it("Should create release filter", async () => {

        //#region ARRANGE

        filtersMock.target.releaseTags = [ "My-Tag-One", "My-Tag-Two" ];
        filtersMock.target.artifactTags = [ "My-Tag-One", "My-Tag-Two" ];
        filtersMock.target.artifactVersion = "My-Build-01";
        filtersMock.target.artifactBranch = "My-Branch";
        filtersMock.target.stageStatuses = [ "succeeded", "rejected" ];

        const primaryBuildArtifactMock = TypeMoq.Mock.ofType<Artifact>();
        primaryBuildArtifactMock.target.sourceId = "1";
        primaryBuildArtifactMock.target.definitionReference = buildDefinitionReferenceMock;

        const buildArtifactMock = TypeMoq.Mock.ofType<Build>();
        buildArtifactMock.target.id = 1;

        releaseHelperMock.setup((x) => x.getDefinitionPrimaryArtifact(definitionMock.target, "Build")).returns(
            () => Promise.resolve(primaryBuildArtifactMock.target));

        buildHelperMock.setup((x) => x.findBuild(primaryBuildArtifactMock.target.definitionReference!.project.name!, primaryBuildArtifactMock.target.definitionReference!.definition.name!, Number(primaryBuildArtifactMock.target.definitionReference!.definition.id!), filtersMock.target.artifactBranch, parametersMock.target.filters.artifactTags, buildCount)).returns(
            () => Promise.resolve(buildArtifactMock.target));

        //#endregion

        //#region ACT

        const result = await filterCreator.createReleaseFilter(definitionMock.target, parametersMock.target.stages, parametersMock.target.filters);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.artifactVersionId).to.eq(buildArtifactMock.target.id);
        chai.expect(result.artifactBranch).to.eq(filtersMock.target.artifactBranch);
        chai.expect(result.tags).to.eql(filtersMock.target.releaseTags);
        chai.expect(result.stages).to.eql(parametersMock.target.stages);
        chai.expect(result.stageStatuses).to.eql([ EnvironmentStatus.Succeeded, EnvironmentStatus.Rejected ]);
        chai.expect(result.releaseStatus).to.eq(ReleaseStatus.Active);

        //#endregion

    });

});
