
import { ApprovalStatus, EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IProgressMonitor } from "./iprogressmonitor";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRun } from "../runcreator/irun";
import { IRunProgress } from "../../orchestrator/irunprogress";
import { RunStatus } from "../../orchestrator/runstatus";
import { IStageApproval } from "../stageapprover/istageapproval";
import { IStageProgress } from "../../orchestrator/istageprogress";

export class ProgressMonitor implements IProgressMonitor {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public createProgress(run: IRun): IRunProgress {

        const debug = this.debugLogger.extend(this.createProgress.name);

        const runProgress: IRunProgress = {

            id: run.build.id!,
            name: run.build.buildNumber!,
            project: run.project.name!,
            url: `${run.project._links.web.href}/_build/results?buildId=${run.build.id}`,
            stages: [],
            status: RunStatus.InProgress,

        };

        for (const stage of run.stages) {

            const approvalStatus: IStageApproval = {

                status: ApprovalStatus.Pending,
                retry: 0,

            };

            const stageProgress: IStageProgress = {

                name: stage.name,
                id: stage.id,
                approval: approvalStatus,
                status: EnvironmentStatus.NotStarted
            }

            runProgress.stages.push(stageProgress);

        }

        debug(runProgress);

        return runProgress;

    }

}
