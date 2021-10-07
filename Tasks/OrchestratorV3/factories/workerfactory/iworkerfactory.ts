import { IDeployer } from "../../workers/deployer/ideployer";
import { ICreator } from "../../workers/creator/icreator";
import { IReporter } from "../../workers/reporter/ireporter";

export interface IWorkerFactory {

    createCreator(): Promise<ICreator>;
    createDeployer(): Promise<IDeployer>;
    createReporter(): Promise<IReporter>;

}
