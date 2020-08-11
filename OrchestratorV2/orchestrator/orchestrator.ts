import Debug from "debug";

import { IOrchestrator } from "../interfaces/orchestrator/orchestrator";
import { IDeployer } from "../interfaces/deployer/deployer";
import { IParameters } from "../interfaces/task/parameters";
import { IDetails } from "../interfaces/task/details";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";

export class Orchestrator implements IOrchestrator {

    private debugLogger: Debug.Debugger;
    private consoleLogger: IConsoleLogger;

    private deployer: IDeployer;

    constructor(deployer: IDeployer, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.deployer = deployer;

    }

    public async orchestrateRelease(parameters: IParameters, details: IDetails) {

        // TBU

    }

}
