import { IRunDeployer } from "../../workers/rundeployer/irundeployer";
import { IRunCreator } from "../../workers/runcreator/iruncreator";
import { IReporter } from "../../workers/reporter/ireporter";

export interface IWorkerFactory {

    createRunCreator(): Promise<IRunCreator>;
    createRunDeployer(): Promise<IRunDeployer>;
    createReporter(): Promise<IReporter>;

}
