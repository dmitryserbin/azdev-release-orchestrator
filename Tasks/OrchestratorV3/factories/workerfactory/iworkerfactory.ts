import { IDeployer } from "../../workers/deployer/ideployer";
import { IRunCreator } from "../../workers/runcreator/iruncreator";
import { IReporter } from "../../workers/reporter/ireporter";

export interface IWorkerFactory {

    createRunCreator(): Promise<IRunCreator>;
    createDeployer(): Promise<IDeployer>;
    createReporter(): Promise<IReporter>;

}
