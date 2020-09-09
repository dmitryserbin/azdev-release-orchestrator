import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDebugCreator } from "../../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../../interfaces/loggers/consolelogger";
import { IDebugLogger } from "../../interfaces/loggers/debuglogger";
import { IReleaseHelper } from "../../interfaces/helpers/releasehelper";
import { IDetails } from "../../interfaces/task/details";
import { ICommonHelper } from "../../interfaces/helpers/commonhelper";
import { IApprover } from "../../interfaces/orchestrator/approver";
import { IStageProgress } from "../../interfaces/common/stageprogress";
import { ISettings } from "../../interfaces/common/settings";
import { Approver } from "../../orchestrator/approver";

describe("Approver", ()  => {

    const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
    const debugCreatorMock = TypeMoq.Mock.ofType<IDebugCreator>();
    debugCreatorMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);
    debugLoggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugLoggerMock.target);

    const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
    consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);

    const commonHelperMock = TypeMoq.Mock.ofType<ICommonHelper>();
    const releaseHelperMock = TypeMoq.Mock.ofType<IReleaseHelper>();

    const projectName: string = "My-Project";

    let detailsMock: TypeMoq.IMock<IDetails>;
    let settingsMock: TypeMoq.IMock<ISettings>;
    let stageProgressMock: TypeMoq.IMock<IStageProgress>;
    let stageStatusMock: TypeMoq.IMock<ReleaseEnvironment>;

    const releaseApprover: IApprover = new Approver(commonHelperMock.target, releaseHelperMock.target, debugCreatorMock.target, consoleLoggerMock.target);

    beforeEach(async () => {

        detailsMock = TypeMoq.Mock.ofType<IDetails>();
        settingsMock = TypeMoq.Mock.ofType<ISettings>();
        stageStatusMock = TypeMoq.Mock.ofType<ReleaseEnvironment>();

        stageProgressMock = TypeMoq.Mock.ofType<IStageProgress>();
        stageProgressMock.setup((x) => x.name).returns(() => "My-Stage-One")

        commonHelperMock.reset();
        releaseHelperMock.reset();

    });

    it("Should approve stage deployment", async () => {

        //#region ARRANGE

        //#endregion

        //#region ACT

        // const result = await releaseApprover.approveStage(stageProgressMock.target, stageStatusMock.target, projectName, detailsMock.target, settingsMock.target);

        //#endregion

        //#region ASSERT

        //#endregion

    });

});
