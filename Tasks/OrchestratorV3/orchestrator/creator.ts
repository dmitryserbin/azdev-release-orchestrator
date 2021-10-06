import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition, BuildStatus } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IParameters } from "../interfaces/task/parameters";
import { IDetails } from "../interfaces/task/details";
import { IDebug } from "../interfaces/loggers/debug";
import { ILogger } from "../interfaces/loggers/logger";
import { ICreator } from "../interfaces/orchestrator/creator";
import { IReleaseJob } from "../interfaces/common/releasejob";
import { ICoreHelper } from "../interfaces/helpers/corehelper";
import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { ReleaseType } from "../interfaces/common/releasetype";
import { IReporter } from "../interfaces/orchestrator/reporter";
import { IBuildFilter } from "../interfaces/common/buildfilter";

export class Creator implements ICreator {

    private logger: ILogger;
    private debugLogger: IDebug;

    private coreHelper: ICoreHelper;
    private buildHelper: IBuildHelper;
    private reporter: IReporter;

    constructor(coreHelper: ICoreHelper, buildHelper: IBuildHelper, reporter: IReporter, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.coreHelper = coreHelper;
        this.buildHelper = buildHelper;
        this.reporter = reporter;

    }

    public async createJob(parameters: IParameters, details: IDetails): Promise<IReleaseJob> {

        const debug = this.debugLogger.extend(this.createJob.name);

        const project: TeamProject = await this.coreHelper.getProject(parameters.projectName);
        const definition: BuildDefinition = await this.buildHelper.getDefinition(parameters.projectName, parameters.definitionName);

        this.logger.log(`Starting <${project.name}> project <${definition.name}> (${definition.id}) pipeline deployment`);

        const build: Build = await this.createBuild(project, definition, parameters);

        return {

            project: project,
            definition: definition,
            build: build,

        } as IReleaseJob;

    }

    private async createBuild(project: TeamProject, definition: BuildDefinition, parameters: IParameters): Promise<Build> {

        const debug = this.debugLogger.extend(this.createBuild.name);

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

                build = await this.buildHelper.createBuild(project.name!, definition, parameters.parameters);

                break;

            } case ReleaseType.Latest: {

                this.logger.log(`Targeting latest <${definition.name}> (${definition.id}) pipeline release`);

                const buildFilter: IBuildFilter = {

                    buildStatus: BuildStatus.Completed,
        
                };

                build = await this.buildHelper.getLatestBuild(project.name!, definition, buildFilter, 100);

                break;

            } case ReleaseType.Specific: {

                this.logger.log(`Targeting specific <${definition.name}> (${definition.id}) pipeline release`);

                // build = await this.releaseHelper.getRelease(project.name!, definition.id!, parameters.releaseName, parameters.stages);

                build = {};

                break;

            }

        }

        debug(`Build <${build.buildNumber}> type <${ReleaseType[parameters.releaseType]}> created`);

        return build;

    }

}
