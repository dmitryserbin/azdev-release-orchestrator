import { IDeployer } from "../workers/deployer";
import { ICreator } from "../workers/creator";

export interface IWorkerFactory {

    createCreator(): Promise<ICreator>;
    createDeployer(): Promise<IDeployer>;

}
