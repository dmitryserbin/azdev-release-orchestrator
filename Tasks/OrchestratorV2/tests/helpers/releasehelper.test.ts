import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";
import { IDebugLogger } from "../../interfaces/loggers/idebuglogger";
import { IDebugCreator } from "../../interfaces/loggers/idebugcreator";
import { ReleaseHelper } from "../../helpers/releasehelper";
import { IReleaseApiRetry } from "../../interfaces/extensions/ireleaseapiretry";
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

describe("ReleaseHelper", () => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    const releaseApiRetryMock = TypeMoq.Mock.ofType<IReleaseApiRetry>();

    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const releaseHelper = new ReleaseHelper(releaseApiRetryMock.object, debugCreatorMock.object);
    const projectName = "projectName";

    it("Should set searchText arg", async () => {

        //#region Arrange

        const alphanumericDefinitionName = "abcdfe123";
        const isExactNameMatch = true;
        const releaseDefinitionId = 123;

        const releaseDefinitionMock = TypeMoq.Mock.ofType<ReleaseDefinition>();
        releaseDefinitionMock.setup(x => x.id).returns(() => releaseDefinitionId);

        //
        // The following line set the mocked object as thenable.
        // Otherwise the Promise.resolve(releaseDefinitionMock.object) would never resolve.
        //
        releaseDefinitionMock.setup((x: any) => x.then).returns(() => undefined);

        const releaseDefinitions: ReleaseDefinition[] = [releaseDefinitionMock.object];

        releaseApiRetryMock.setup(x => x.getReleaseDefinitions(
            projectName,
            alphanumericDefinitionName,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            isExactNameMatch)
        ).returns(() => Promise.resolve(releaseDefinitions))

        releaseApiRetryMock.setup(x => x.getReleaseDefinition(projectName, releaseDefinitionId))
            .returns(() => Promise.resolve(releaseDefinitionMock.object));

        //#endregion

        //#region Act

        const releaseDefinition = await releaseHelper.getDefinition(
            projectName,
            alphanumericDefinitionName);

        //#endregion

        //#region Assert
        chai.expect(releaseDefinition).is.not.undefined;
        chai.expect(releaseDefinition.id).to.equal(releaseDefinitionId);

        //#endregion
    });

    it("Should set definitionIdsFilter arg", async () => {

        //#region Arrange

        const numericDefinitionName = "101";
        const releaseDefinitionId = 101;

        const releaseDefinitionMock = TypeMoq.Mock.ofType<ReleaseDefinition>();
        releaseDefinitionMock.setup(x => x.id).returns(() => releaseDefinitionId);

        //
        // The following line set the mocked object as thenable.
        // Otherwise the Promise.resolve(releaseDefinitionMock.object) would never resolve.
        //
        releaseDefinitionMock.setup((x: any) => x.then).returns(() => undefined);

        const releaseDefinitions: ReleaseDefinition[] = [releaseDefinitionMock.object];

        releaseApiRetryMock.setup(x => x.getReleaseDefinitions(
            projectName,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            TypeMoq.It.is(x => x![0] === numericDefinitionName))
        ).returns(() => Promise.resolve(releaseDefinitions))

        releaseApiRetryMock.setup(x => x.getReleaseDefinition(projectName, releaseDefinitionId))
            .returns(() => Promise.resolve(releaseDefinitionMock.object));

        //#endregion

        //#region Act

        const releaseDefinition = await releaseHelper.getDefinition(
            projectName,
            numericDefinitionName);

        //#endregion

        //#region Assert
        chai.expect(releaseDefinition).is.not.undefined;
        chai.expect(releaseDefinition.id).to.equal(releaseDefinitionId);

        //#endregion
    }).timeout(999999);

});

process.on("unhandledRejection", (error: unknown) => {

    console.error(error);
    process.exit(1);

});
