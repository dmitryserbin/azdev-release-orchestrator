import { IDeployer } from "../orchestrator/deployer";
import { ICreator } from "../orchestrator/creator";

export interface IOrchestratorFactory {

    createCreator(): Promise<ICreator>;
    createDeployer(): Promise<IDeployer>;

}
