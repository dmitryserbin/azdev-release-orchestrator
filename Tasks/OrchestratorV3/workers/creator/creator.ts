import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IDetails } from "../../helpers/taskhelper/idetails";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { ICreator } from "./icreator";
import { IJob } from "./ijob";
import { ICoreHelper } from "../../helpers/corehelper/icorehelper";
import { IBuildHelper } from "../../helpers/buildhelper/ibuildhelper";
import { ReleaseType } from "../../helpers/taskhelper/releasetype";
import { IReporter } from "../reporter/ireporter";
import { IBuildFilter } from "../filtrator/ibuildfilter";
import { IFiltrator } from "../filtrator/ifiltrator";
import { JobType } from "./jobtype";

export class Creator implements ICreator {

    private logger: ILogger;
    private debugLogger: IDebug;

    private coreHelper: ICoreHelper;
    private buildHelper: IBuildHelper;
    private filtrator: IFiltrator;
    private reporter: IReporter;

    constructor(coreHelper: ICoreHelper, buildHelper: IBuildHelper, filtrator: IFiltrator, reporter: IReporter, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.coreHelper = coreHelper;
        this.buildHelper = buildHelper;
        this.filtrator = filtrator;
        this.reporter = reporter;

    }

    public async createJob(parameters: IParameters, details: IDetails): Promise<IJob> {

        const debug = this.debugLogger.extend(this.createJob.name);

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
                        this.reporter.getParameters(parameters.parameters)
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
        const jobType: JobType = JobType.Automated;

        const job: IJob = {

            project: project,
            definition: definition,
            build: build,
            stages: stages,
            type: jobType,
            settings: parameters.settings,

        };

        debug(`Job <${build.buildNumber}> type <${JobType[jobType]}> created`);

        return job;

    }

}
