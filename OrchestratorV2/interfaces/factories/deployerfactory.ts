import { IDeployer } from "../deployer/deployer";

export interface IDeployerFactory {

    createDeployer(): Promise<IDeployer>;

}
