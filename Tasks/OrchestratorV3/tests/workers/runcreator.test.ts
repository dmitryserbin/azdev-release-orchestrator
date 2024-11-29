import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { faker } from "@faker-js/faker";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IBuildSelector } from "../../helpers/buildselector/ibuildselector";
import { IDefinitionSelector } from "../../helpers/definitionselector/idefinitionselector";
import { IProjectSelector } from "../../helpers/projectselector/iprojectselector";
import { IFilterCreator } from "../../workers/filtercreator/ifiltercreator";
import { IProgressReporter } from "../../workers/progressreporter/iprogressreporter";
import { IRunCreator } from "../../workers/runcreator/iruncreator";
import { RunCreator } from "../../workers/runcreator/runcreator";
import { IParameters } from "../../helpers/taskhelper/iparameters";
import { Strategy } from "../../helpers/taskhelper/strategy";
import { IFilters } from "../../helpers/taskhelper/ifilters";

describe("RunCreator", async () => {

    const loggerMock = TypeMoq.Mock.ofType<ILogger>();
    const debugMock = TypeMoq.Mock.ofType<IDebug>();

    loggerMock
        .setup((x) => x.log(TypeMoq.It.isAny()))
        .returns(() => null);

    loggerMock
        .setup((x) => x.extend(TypeMoq.It.isAnyString()))
        .returns(() => debugMock.object);

    debugMock
        .setup((x) => x.extend(TypeMoq.It.isAnyString()))
        .returns(() => debugMock.object);

    const filtersMock = {

        buildNumber: faker.word.sample(),

    } as IFilters;

    const parametersMock = {

        projectName: faker.word.sample(),
        definitionName: faker.word.sample(),
        filters: filtersMock,

    } as IParameters;

    const projectMock = {

        name: faker.word.sample(),
        id: faker.word.sample(),

    } as TeamProject;

    const definitionMock = {

        name: faker.word.sample(),
        id: faker.number.int(),

    } as BuildDefinition;

    const buildMock = {

        buildNumber: faker.word.sample(),
        id: faker.number.int(),

    } as Build;

    const projectSelectorMock = TypeMoq.Mock.ofType<IProjectSelector>();
    const definitionSelectorMock = TypeMoq.Mock.ofType<IDefinitionSelector>();
    const buildSelectorMock = TypeMoq.Mock.ofType<IBuildSelector>();
    const filterCreatorMock = TypeMoq.Mock.ofType<IFilterCreator>();
    const progressReporterMock = TypeMoq.Mock.ofType<IProgressReporter>();

    const runCreator: IRunCreator = new RunCreator(projectSelectorMock.object, definitionSelectorMock.object, buildSelectorMock.object, filterCreatorMock.object, progressReporterMock.object, loggerMock.object);

    beforeEach(async () => {

        projectSelectorMock.reset();
        definitionSelectorMock.reset();
        buildSelectorMock.reset();
        filterCreatorMock.reset();
        progressReporterMock.reset();

        projectSelectorMock
            .setup((x) => x.getProject(TypeMoq.It.isAnyString()))
            .returns(() => Promise.resolve(projectMock))
            .verifiable(TypeMoq.Times.once());

        definitionSelectorMock
            .setup((x) => x.getDefinition(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString()))
            .returns(() => Promise.resolve(definitionMock))
            .verifiable(TypeMoq.Times.once());

    });

    it("Should create new run", async () => {

        //#region ARRANGE

        parametersMock.strategy = Strategy.New;

        buildSelectorMock
            .setup((x) => x.createBuild(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
            .returns(() => Promise.resolve(buildMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await runCreator.create(parametersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        projectSelectorMock.verifyAll();
        definitionSelectorMock.verifyAll();
        buildSelectorMock.verifyAll();

        //#endregion

    });

    it("Should target latest run", async () => {

        //#region ARRANGE

        parametersMock.strategy = Strategy.Latest;

        buildSelectorMock
            .setup((x) => x.getLatestBuild(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAnyNumber()))
            .returns(() => Promise.resolve(buildMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await runCreator.create(parametersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        projectSelectorMock.verifyAll();
        definitionSelectorMock.verifyAll();
        buildSelectorMock.verifyAll();

        //#endregion

    });

    it("Should target specific run", async () => {

        //#region ARRANGE

        parametersMock.strategy = Strategy.Specific;

        buildSelectorMock
            .setup((x) => x.getSpecificBuild(TypeMoq.It.isAny(), TypeMoq.It.isAnyString()))
            .returns(() => Promise.resolve(buildMock))
            .verifiable(TypeMoq.Times.once());

        //#endregion

        //#region ACT

        const result = await runCreator.create(parametersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);

        projectSelectorMock.verifyAll();
        definitionSelectorMock.verifyAll();
        buildSelectorMock.verifyAll();

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
