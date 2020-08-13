import Debug from "debug";

import { Release, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IDetails } from "../interfaces/task/details";
import { IDeployer } from "../interfaces/workers/deployer";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseJob } from "../interfaces/orchestrator/releasejob";
import { IMonitor } from "../interfaces/orchestrator/monitor";
import { Monitor } from "../orchestrator/monitor";
import { IStageProgress } from "../interfaces/orchestrator/stageprogress";
import { IReleaseProgress } from "../interfaces/orchestrator/releaseprogress";
import { ReleaseStatus } from "../interfaces/orchestrator/releasestatus";

export class Deployer implements IDeployer {

    private debugLogger: Debug.Debugger;
    private consoleLogger: IConsoleLogger;

    private coreHelper: ICoreHelper;
    private releaseHelper: IReleaseHelper;
    private progressMonitor: IMonitor;

    constructor(coreHelper: ICoreHelper, releaseHelper: IReleaseHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.coreHelper = coreHelper;
        this.releaseHelper = releaseHelper;

        this.progressMonitor = new Monitor(debugLogger);

    }

    public async deployManual(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployManual.name);

        this.consoleLogger.log(`Release orchestrated manually as stages deployment conditions are NOT met`);

        const releaseProgress: IReleaseProgress = {

            name: "",
            url: "",
            stages: [],
            status: ReleaseStatus.InProgress,

        };

        return releaseProgress;

    }

    public async deployAutomated(releaseJob: IReleaseJob, details: IDetails): Promise<IReleaseProgress> {

        const debug = this.debugLogger.extend(this.deployAutomated.name);

        this.consoleLogger.log(`Release automatically started as stages deployment conditions are met`);

        const releaseProgress: IReleaseProgress = this.progressMonitor.createProgress(releaseJob.release, releaseJob.stages);

        do {

            const releaseStatus: Release = await this.releaseHelper.getReleaseStatus(releaseJob.project.name!, releaseJob.release.id!);

            const activeStages: IStageProgress[] = this.progressMonitor.getActiveStages(releaseProgress);

            for (const stage of activeStages) {

                const stageStatus: ReleaseEnvironment = await this.releaseHelper.getStageStatus(releaseStatus, stage.name);

                this.progressMonitor.updateStageProgress(stage, stageStatus);

                if (this.progressMonitor.isStageCompleted(stage)) {

                    break;

                }

            }

            this.progressMonitor.updateReleaseProgress(releaseProgress);

            await this.wait(releaseJob.sleep);

        } while (releaseProgress.status === ReleaseStatus.InProgress);

        return releaseProgress;

    }

    public async isAutomated(releaseJob: IReleaseJob): Promise<boolean> {

        const debug = this.debugLogger.extend(this.isAutomated.name);

        const status: boolean = await this.releaseHelper.getConditionsStatus(releaseJob.release);

        debug(status);

        return status;

    }

    private async wait(count: number): Promise<void> {

        const debug = this.debugLogger.extend(this.wait.name);

        debug(`Waiting <${count}> milliseconds`);

        return new Promise((resolve) => setTimeout(resolve, count));

    }

}
