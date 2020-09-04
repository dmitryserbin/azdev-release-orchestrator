import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ReleaseDefinition, Release } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IParameters } from "../../interfaces/task/parameters";
import { IDetails } from "../../interfaces/task/details";
import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../../interfaces/loggers/consolelogger";
import { ICreator } from "../../interfaces/orchestrator/creator";
import { IReporter } from "../../interfaces/orchestrator/reporter";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { Creator } from "../../orchestrator/creator";
import { ICoreHelper } from "../../interfaces/helpers/corehelper";
import { IBuildHelper } from "../../interfaces/helpers/buildhelper";
import { IReleaseHelper } from "../../interfaces/helpers/releasehelper";
import { ReleaseType } from "../../interfaces/common/releasetype";
import { DeploymentType } from "../../interfaces/common/deploymenttype";

describe("Creator", ()  => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
    consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);

    const reporterMock = TypeMoq.Mock.ofType<IReporter>();
    reporterMock.setup((x) => x.getRelease(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => "");
    reporterMock.setup((x) => x.getReleaseProgress(TypeMoq.It.isAny())).returns(() => "");
    reporterMock.setup((x) => x.getFilters(TypeMoq.It.isAny())).returns(() => "");
    reporterMock.setup((x) => x.getVariables(TypeMoq.It.isAny())).returns(() => "");

    const coreHelperMock = TypeMoq.Mock.ofType<ICoreHelper>();
    const buildHelperMock = TypeMoq.Mock.ofType<IBuildHelper>();
    const releaseHelperMock = TypeMoq.Mock.ofType<IReleaseHelper>();

    let detailsMock: TypeMoq.IMock<IDetails>;
    let parametersMock: TypeMoq.IMock<IParameters>;

    const creator: ICreator = new Creator(coreHelperMock.target, buildHelperMock.target, releaseHelperMock.target, reporterMock.target, debugCreatorMock.target, consoleLoggerMock.target);

    beforeEach(async () => {

        detailsMock = TypeMoq.Mock.ofType<IDetails>();
        parametersMock = TypeMoq.Mock.ofType<IParameters>();

        coreHelperMock.reset();
        buildHelperMock.reset();
        releaseHelperMock.reset();
        reporterMock.reset();

    });

    it("Should create new release job", async () => {

        //#region ARRANGE

        parametersMock.target.releaseType = ReleaseType.New;

        const projectMock = TypeMoq.Mock.ofType<TeamProject>();
        const definitionMock = TypeMoq.Mock.ofType<ReleaseDefinition>();
        const releaseMock = TypeMoq.Mock.ofType<Release>();

        coreHelperMock.setup((x) => x.getProject(parametersMock.target.projectName)).returns(
            () => Promise.resolve(projectMock.target));

        releaseHelperMock.setup((x) => x.getDefinition(projectMock.target.name!, parametersMock.target.definitionName)).returns(
            () => Promise.resolve(definitionMock.target));

        releaseHelperMock.setup((x) => x.createRelease(projectMock.target.name!, definitionMock.target, detailsMock.target)).returns(
            () => Promise.resolve(releaseMock.target));

        releaseHelperMock.setup((x) => x.getDefinitionPrimaryArtifact(definitionMock.target, "Build")).returns(
            () => Promise.resolve(null));

        releaseHelperMock.setup((x) => x.getReleaseType(releaseMock.target)).returns(
            () => Promise.resolve(DeploymentType.Automated));

        //#endregion

        //#region ACT

        const result = await creator.createJob(parametersMock.target, detailsMock.target);

        //#endregion

        //#region ASSERT

        // TBU

        //#endregion

    });

});
