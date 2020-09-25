import { IDeployer } from "../orchestrator/deployer";
import { ICreator } from "../orchestrator/creator";
import { IReporter } from "../orchestrator/reporter";

export interface IOrchestratorFactory {

    createCreator(): Promise<ICreator>;
    createDeployer(): Promise<IDeployer>;
    createReporter(): Promise<IReporter>;

}
