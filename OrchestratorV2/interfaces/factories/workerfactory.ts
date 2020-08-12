import { IDeployer } from "../deployer/deployer";

export interface IWorkerFactory {

    createDeployer(): Promise<IDeployer>;

}
