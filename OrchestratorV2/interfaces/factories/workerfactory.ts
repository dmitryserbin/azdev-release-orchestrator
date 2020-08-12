import { IDeployer } from "../workers/deployer";

export interface IWorkerFactory {

    createDeployer(): Promise<IDeployer>;

}
