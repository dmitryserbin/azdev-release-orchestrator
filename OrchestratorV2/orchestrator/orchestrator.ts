import Debug from "debug";

import { IOrchestrator } from "../interfaces/orchestrator/orchestrator";
import { IDeployer } from "../interfaces/deployer/deployer";
import { IParameters } from "../interfaces/task/parameters";
import { IDetails } from "../interfaces/task/details";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IEndpoint } from "../interfaces/task/endpoint";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { ApiFactory } from "../factories/apifactory";
import { IDeployerFactory } from "../interfaces/factories/deployerfactory";
import { DeployerFactory } from "../factories/deployerfactory";

export class Orchestrator implements IOrchestrator {

    private debugLogger: Debug.Debugger;
    private consoleLogger: IConsoleLogger;

    private deployerFactory: IDeployerFactory;

    constructor(endpoint: IEndpoint, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.consoleLogger = consoleLogger;

        const apiFactory: IApiFactory = new ApiFactory(endpoint.account, endpoint.token, debugLogger);

        this.deployerFactory = new DeployerFactory(apiFactory, debugLogger, consoleLogger);

    }

    public async run(parameters: IParameters, details: IDetails) {

        const deployer: IDeployer = await this.deployerFactory.createDeployer();

    }

}
