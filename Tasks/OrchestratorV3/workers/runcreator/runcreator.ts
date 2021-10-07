import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IDetails } from "../../helpers/taskhelper/idetails";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRunCreator } from "./iruncreator";
import { IRun } from "./irun";
import { ICoreHelper } from "../../helpers/corehelper/icorehelper";
import { IBuildHelper } from "../../helpers/buildhelper/ibuildhelper";
import { ReleaseType } from "../../helpers/taskhelper/releasetype";
import { IProgressReporter } from "../progressreporter/iprogressreporter";
import { IBuildFilter } from "../filtrator/ibuildfilter";
import { IFiltrator } from "../filtrator/ifiltrator";
import { RunType } from "../orchestrator/runtype";

export class RunCreator implements IRunCreator {

    private logger: ILogger;
    private debugLogger: IDebug;

    private coreHelper: ICoreHelper;
    private buildHelper: IBuildHelper;
    private filtrator: IFiltrator;
    private progressReporter: IProgressReporter;

    constructor(coreHelper: ICoreHelper, buildHelper: IBuildHelper, filtrator: IFiltrator, progressReporter: IProgressReporter, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.coreHelper = coreHelper;
        this.buildHelper = buildHelper;
        this.filtrator = filtrator;
        this.progressReporter = progressReporter;

    }

    public async create(parameters: IParameters, details: IDetails): Promise<IRun> {

        const debug = this.debugLogger.extend(this.create.name);

        const project: TeamProject = await this.coreHelper.getProject(parameters.projectName);
        const definition: BuildDefinition = await this.buildHelper.getDefinition(parameters.projectName, parameters.definitionName);

        this.logger.log(`Starting <${project.name}> project <${definition.name}> (${definition.id}) pipeline deployment`);

        let build: Build;

        switch (parameters.releaseType) {

            case ReleaseType.New: {

                this.logger.log(`Creating new <${definition.name}> (${definition.id}) pipeline release`);

                if (parameters.parameters && Object.keys(parameters.parameters).length) {

                    this.logger.log(`Overridding <${Object.keys(parameters.parameters).length}> pipeline <${definition.name}> parameters`);

                    this.logger.log(
                        this.progressReporter.getParameters(parameters.parameters)
                    );

                }

                build = await this.buildHelper.createBuild(project.name!, definition, parameters.stages, parameters.parameters);

                break;

            } case ReleaseType.Latest: {

                this.logger.log(`Targeting latest <${definition.name}> (${definition.id}) pipeline release`);

                const buildFilter: IBuildFilter = await this.filtrator.createBuildFilter();

                build = await this.buildHelper.getLatestBuild(project.name!, definition, buildFilter, 100);

                break;

            } case ReleaseType.Specific: {

                this.logger.log(`Targeting specific <${definition.name}> (${definition.id}) pipeline release`);

                build = await this.buildHelper.getBuild(project.name!, definition, parameters.buildNumber);

                break;

            }

        }

        debug(`Build <${build.buildNumber}> type <${ReleaseType[parameters.releaseType]}> created`);

        const stages: string[] = [];
        const jobType: RunType = RunType.Automated;

        const run: IRun = {

            project: project,
            definition: definition,
            build: build,
            stages: stages,
            type: jobType,
            settings: parameters.settings,

        };

        debug(`Run <${build.buildNumber}> type <${RunType[jobType]}> created`);

        return run;

    }

}
