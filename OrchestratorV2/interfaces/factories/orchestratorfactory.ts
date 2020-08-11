import { IDeployer } from "../deployer/deployer";

export interface IOrchestratorFactory {

    createDeployer(): Promise<IDeployer>;

}
