import { IOrchestratorFactory } from "../interfaces/factories/orchestratorfactory";
import { IApiFactory } from "../interfaces/factories/apifactory";
import { IDebugCreator } from "../interfaces/loggers/debugcreator";
import { IConsoleLogger } from "../interfaces/loggers/consolelogger";
import { IDeployer } from "../interfaces/orchestrator/deployer";
import { Deployer } from "../orchestrator/deployer";
import { ICreator } from "../interfaces/orchestrator/creator";
import { Creator } from "../orchestrator/creator";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { Reporter } from "../orchestrator/reporter";

export class OrchestratorFactory implements IOrchestratorFactory {

    private debugCreator: IDebugCreator;
    private consoleLogger: IConsoleLogger;

    private apiFactory: IApiFactory;

    constructor(apiFactory: IApiFactory, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugCreator = debugCreator;
        this.consoleLogger = consoleLogger;

        this.apiFactory = apiFactory;

    }

    public async createCreator(): Promise<ICreator> {

        return new Creator(this.debugCreator, this.consoleLogger);

    }

    public async createDeployer(): Promise<IDeployer> {

        return new Deployer(this.debugCreator, this.consoleLogger);

    }

    public async createReporter(): Promise<IReporter> {

        return new Reporter(this.debugCreator);

    }

}
