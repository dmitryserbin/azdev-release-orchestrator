import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { ReleaseDefinition, Artifact, ArtifactMetadata } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IParameters } from "../../interfaces/task/parameters";
import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../../interfaces/loggers/consolelogger";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { IBuildHelper } from "../../interfaces/helpers/buildhelper";
import { IReleaseHelper } from "../../interfaces/helpers/releasehelper";
import { IFilters } from "../../interfaces/task/filters";
import { ISettings } from "../../interfaces/common/settings";
import { IFiltrator } from "../../interfaces/orchestrator/filtrator";
import { Filtrator } from "../../orchestrator/filtrator";

describe("Filtrator", ()  => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
    consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);

    const buildHelperMock = TypeMoq.Mock.ofType<IBuildHelper>();
    const releaseHelperMock = TypeMoq.Mock.ofType<IReleaseHelper>();

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

        filtersMock.target.artifactBranch = "My-Branch";
        filtersMock.target.artifactTags = [ "My-Tag-One", "My-Tag-Two" ];

        const artifactsMock = TypeMoq.Mock.ofType<ArtifactMetadata[]>();

        const primaryBuildArtifactMock = TypeMoq.Mock.ofType<Artifact>();
        primaryBuildArtifactMock.target.sourceId = "1";
        primaryBuildArtifactMock.target.definitionReference = {

            definition: {

                id: "1",

            },

        }

        const buildMock = TypeMoq.Mock.ofType<Build>();
        buildMock.target.id = 1

        releaseHelperMock.setup((x) => x.getDefinitionPrimaryArtifact(definitionMock.target, "Build")).returns(
            () => Promise.resolve(primaryBuildArtifactMock.target));

        buildHelperMock.setup((x) => x.findBuild(projectMock.target.name!, Number(primaryBuildArtifactMock.target.definitionReference!.definition.id), parametersMock.target.filters.artifactTags)).returns(
            () => Promise.resolve(buildMock.target));

        releaseHelperMock.setup((x) => x.getArtifacts(projectMock.target.name!, definitionMock.target.id!, primaryBuildArtifactMock.target.sourceId!, buildMock.target.id!.toString(), parametersMock.target.filters.artifactBranch)).returns(
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
        filtersMock.target.artifactBranch = "My-Branch";
        filtersMock.target.stageStatuses = [ "Succeeded", "Rejected" ];

        const primaryBuildArtifactMock = TypeMoq.Mock.ofType<Artifact>();
        primaryBuildArtifactMock.target.sourceId = "1";
        primaryBuildArtifactMock.target.definitionReference = {

            definition: {

                id: "1",

            },

        }

        const buildMock = TypeMoq.Mock.ofType<Build>();
        buildMock.target.id = 1

        releaseHelperMock.setup((x) => x.getDefinitionPrimaryArtifact(definitionMock.target, "Build")).returns(
            () => Promise.resolve(primaryBuildArtifactMock.target));

        buildHelperMock.setup((x) => x.findBuild(projectMock.target.name!, Number(primaryBuildArtifactMock.target.definitionReference!.definition.id), parametersMock.target.filters.artifactTags)).returns(
            () => Promise.resolve(buildMock.target));

        //#endregion

        //#region ACT

        const result = await filterCreator.createReleaseFilter(projectMock.target, definitionMock.target, parametersMock.target.stages, parametersMock.target.filters);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        //#endregion

    });

});
