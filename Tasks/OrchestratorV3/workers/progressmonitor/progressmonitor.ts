import { IProgressMonitor } from "./iprogressmonitor";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { RunStatus } from "../../orchestrator/runstatus";

export class ProgressMonitor implements IProgressMonitor {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public createProgress(run: IRun): IRunProgress {

        const debug = this.debugLogger.extend(this.createProgress.name);

        const url: string = `${run.project._links.web.href}/_build/results?buildId=${run.build.id}`;

        const releaseProgress: IRunProgress = {

            id: run.build.id ? run.build.id : 0,
            name: run.build.buildNumber ? run.build.buildNumber : "-",
            project: run.project.name ? run.project.name : "-",
            url,
            stages: [],
            status: RunStatus.InProgress,

        };

        return releaseProgress;

    }

}
