import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Build, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { IParameters } from "../../helpers/taskhelper/iparameters";
import { IDebug } from "../../loggers/idebug";
import { ILogger } from "../../loggers/ilogger";
import { IRunCreator } from "./iruncreator";
import { IRun } from "./irun";
import { ReleaseType } from "../../helpers/taskhelper/releasetype";
import { IProgressReporter } from "../progressreporter/iprogressreporter";
import { IBuildFilter } from "../filtercreator/ibuildfilter";
import { IFilterCreator } from "../filtercreator/ifiltercreator";
import { IBuildSelector } from "../../helpers/buildselector/ibuildselector";
import { IProjectSelector } from "../../helpers/projectselector/iprojectselector";
import { IDefinitionSelector } from "../../helpers/definitionselector/idefinitionselector";
import { IResourcesFilter } from "../filtercreator/iresourcesfilter";

export class RunCreator implements IRunCreator {

    private logger: ILogger;
    private debugLogger: IDebug;

    private projectSelector: IProjectSelector;
    private definitionSelector: IDefinitionSelector;
    private buildSelector: IBuildSelector;
    private filterCreator: IFilterCreator;
    private progressReporter: IProgressReporter;

    constructor(projectSelector: IProjectSelector, definitionSelector: IDefinitionSelector, buildSelector: IBuildSelector, filterCreator: IFilterCreator, progressReporter: IProgressReporter, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.projectSelector = projectSelector;
        this.definitionSelector = definitionSelector;
        this.buildSelector = buildSelector;
        this.filterCreator = filterCreator;
        this.progressReporter = progressReporter;

    }

    public async create(parameters: IParameters): Promise<IRun> {

        const debug = this.debugLogger.extend(this.create.name);

        const project: TeamProject = await this.projectSelector.getProject(parameters.projectName);
        const definition: BuildDefinition = await this.definitionSelector.getDefinition(parameters.projectName, parameters.definitionName);

        this.logger.log(`Starting <${project.name}> project <${definition.name}> (${definition.id}) pipeline deployment`);

        let build: Build;

        switch (parameters.releaseType) {

            case ReleaseType.New: {

                this.logger.log(`Creating new <${definition.name}> (${definition.id}) pipeline release`);

                this.progressReporter.logFilters(parameters.filters);

                if (parameters.parameters && Object.keys(parameters.parameters).length) {

                    this.logger.log(`Overridding <${Object.keys(parameters.parameters).length}> pipeline <${definition.name}> parameters`);

                    this.progressReporter.logParameters(parameters.parameters);

                }

                const resourcesFilter: IResourcesFilter = await this.filterCreator.createResourcesFilter(parameters.filters);

                build = await this.buildSelector.createBuild(definition, resourcesFilter, parameters.stages, parameters.parameters);

                break;

            } case ReleaseType.Latest: {

                this.logger.log(`Targeting latest <${definition.name}> (${definition.id}) pipeline release`);

                this.progressReporter.logFilters(parameters.filters);

                const buildFilter: IBuildFilter = await this.filterCreator.createBuildFilter();

                build = await this.buildSelector.getLatestBuild(definition, buildFilter, 100);

                break;

            } case ReleaseType.Specific: {

                this.logger.log(`Targeting specific <${definition.name}> (${definition.id}) pipeline release`);

                build = await this.buildSelector.getSpecificBuild(definition, parameters.buildNumber);

                break;

            }

        }

        const stages: string[] = parameters.stages.length ? parameters.stages : await this.buildSelector.getBuildStages(build);

        const run: IRun = {

            project: project,
            definition: definition,
            build: build,
            stages: stages,
            settings: parameters.settings,

        };

        debug(`Run <${build.buildNumber}> (${build.id}) type <${ReleaseType[parameters.releaseType]}> created`);

        return run;

    }

}
