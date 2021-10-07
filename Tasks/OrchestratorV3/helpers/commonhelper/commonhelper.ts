import { IDebug } from "../../loggers/idebug";
import { ICommonHelper } from "./icommonhelper";
import { ILogger } from "../../loggers/ilogger";

export class CommonHelper implements ICommonHelper {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public async wait(count: number): Promise<void> {

        const debug = this.debugLogger.extend(this.wait.name);

        debug(`Waiting <${count}> milliseconds`);

        return new Promise((resolve) => setTimeout(resolve, count));

    }

}
