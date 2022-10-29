import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { BuildResult } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";
import { IFilterCreator } from "../../workers/filtercreator/ifiltercreator";
import { FilterCreator } from "../../workers/filtercreator/filtercreator";
import { IFilters } from "../../helpers/taskhelper/ifilters";

describe("FilterCreator", async () => {

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

    let filtersMock: IFilters;

    const filterCreator: IFilterCreator = new FilterCreator(loggerMock.object);

    beforeEach(async () => {

        filtersMock = {

            buildNumber: "",
            branchName: "",
            buildResult: "",
            buildTags: [],
            pipelineResources: {},
            repositoryResources: {},

        } as IFilters;

    });

    it("Should create resource filter (branch name)", async () => {

        //#region ARRANGE

        filtersMock.branchName = "My-Branch";

        //#endregion

        //#region ACT

        const result = await filterCreator.createResourcesFilter(filtersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.repositories.self).to.not.eq(null);
        chai.expect(result.repositories.self.refName).to.eq(`refs/heads/${filtersMock.branchName}`);

        //#endregion

    });

    it("Should create build filter (build result)", async () => {

        //#region ARRANGE

        filtersMock.buildResult = "Succeeded";

        //#endregion

        //#region ACT

        const result = await filterCreator.createBuildFilter(filtersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.buildResult).to.eq(BuildResult.Succeeded);

        //#endregion

    });

    it("Should create build filter (build tags)", async () => {

        //#region ARRANGE

        filtersMock.buildTags = [ "One", "Two" ];

        //#endregion

        //#region ACT

        const result = await filterCreator.createBuildFilter(filtersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.tagFilters).to.not.eq(null);
        chai.expect(result.tagFilters).to.eq(filtersMock.buildTags);

        //#endregion

    });

    it("Should create build filter (branch name)", async () => {

        //#region ARRANGE

        filtersMock.branchName = "My-Branch";

        //#endregion

        //#region ACT

        const result = await filterCreator.createBuildFilter(filtersMock);

        //#endregion

        //#region ASSERT

        chai.expect(result).to.not.eq(null);
        chai.expect(result.branchName).to.eq(`refs/heads/${filtersMock.branchName}`);

        //#endregion

    });

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
