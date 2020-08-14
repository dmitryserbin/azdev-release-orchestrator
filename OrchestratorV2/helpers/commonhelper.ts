import { IDebugLogger, IDebugger } from "../interfaces/loggers/debuglogger";
import { ICommonHelper } from "../interfaces/helpers/commonhelper";

export class CommonHelper implements ICommonHelper {

    private debugLogger: IDebugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

    public async wait(count: number): Promise<void> {

        const debug = this.debugLogger.extend(this.wait.name);

        debug(`Waiting <${count}> milliseconds`);

        return new Promise((resolve) => setTimeout(resolve, count));

    }

}
