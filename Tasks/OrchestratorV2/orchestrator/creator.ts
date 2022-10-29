import { Release, ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IParameters } from "../interfaces/task/iparameters";
import { ReleaseType } from "../interfaces/common/ireleasetype";
import { IDetails } from "../interfaces/task/idetails";
import { IDebugCreator } from "../interfaces/loggers/idebugcreator";
import { IDebugLogger } from "../interfaces/loggers/idebuglogger";
import { IConsoleLogger } from "../interfaces/loggers/iconsolelogger";
import { ICoreHelper } from "../interfaces/helpers/icorehelper";
import { IReleaseHelper } from "../interfaces/helpers/ireleasehelper";
import { ICreator } from "../interfaces/orchestrator/icreator";
import { IReleaseJob } from "../interfaces/common/ireleasejob";
import { IReleaseFilter } from "../interfaces/common/ireleasefilter";
import { IArtifactFilter } from "../interfaces/common/iartifactfilter";
import { DeploymentType } from "../interfaces/common/ideploymenttype";
import { IReporter } from "../interfaces/orchestrator/ireporter";
import { IFiltrator } from "../interfaces/orchestrator/ifiltrator";

export class Creator implements ICreator {

    private debugLogger: IDebugLogger;
    private consoleLogger: IConsoleLogger;

    private coreHelper: ICoreHelper;
    private releaseHelper: IReleaseHelper;
    private filterCreator: IFiltrator;
    private progressReporter: IReporter;

    constructor(coreHelper: ICoreHelper, releaseHelper: IReleaseHelper, filterCreator: IFiltrator, progressReporter: IReporter, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugCreator.extend(this.constructor.name);
        this.consoleLogger = consoleLogger;

        this.coreHelper = coreHelper;
        this.releaseHelper = releaseHelper;
        this.filterCreator = filterCreator;
        this.progressReporter = progressReporter;

    }

    public async createJob(parameters: IParameters, details: IDetails): Promise<IReleaseJob> {

        const debug = this.debugLogger.extend(this.createJob.name);

        const targetProject: TeamProject = await this.coreHelper.getProject(parameters.projectName);
        const targetDefinition: ReleaseDefinition = await this.releaseHelper.getDefinition(targetProject.name!, parameters.definitionName);

        this.consoleLogger.log(`Starting <${targetProject.name}> project <${targetDefinition.name}> release pipeline deployment`);

        const targetRelease: Release = await this.createRelease(targetProject, targetDefinition, parameters, details);

        const targetStages: string[] = await this.releaseHelper.getReleaseStages(targetRelease, parameters.stages);
        const releaseType: DeploymentType = await this.releaseHelper.getReleaseType(targetRelease);

        const releaseJob: IReleaseJob = {

            project: targetProject,
            definition: targetDefinition,
            release: targetRelease,
            stages: targetStages,
            type: releaseType,
            settings: parameters.settings,

        };

        debug(`Release <${targetRelease.name}> (<${targetStages?.join("|")}>) job cleated`);

        return releaseJob;

    }

    private async createRelease(project: TeamProject, definition: ReleaseDefinition, parameters: IParameters, details: IDetails): Promise<Release> {

        const debug = this.debugLogger.extend(this.createRelease.name);

        let release: Release;

        switch (parameters.releaseType) {

            case ReleaseType.New: {

                this.consoleLogger.log(`Creating new <${definition.name}> (${definition.id}) release pipeline release`);

                this.consoleLogger.log(
                    this.progressReporter.getFilters(parameters.filters),
                );

                const artifactFilter: IArtifactFilter[] = await this.filterCreator.createArtifactFilter(project, definition, parameters.filters);

                if (Array.isArray(parameters.variables) && parameters.variables.length) {

                    this.consoleLogger.log(`Overridding <${parameters.variables.length}> release pipeline <${definition.name}> variable(s)`);

                    this.consoleLogger.log(
                        this.progressReporter.getVariables(parameters.variables),
                    );

                }

                release = await this.releaseHelper.createRelease(project.name!, definition, details, parameters.stages, parameters.variables, artifactFilter);

                break;

            } case ReleaseType.Latest: {

                this.consoleLogger.log(`Targeting latest <${definition.name}> (${definition.id}) release pipeline release`);

                this.consoleLogger.log(
                    this.progressReporter.getFilters(parameters.filters),
                );

                const releaseFilter: IReleaseFilter = await this.filterCreator.createReleaseFilter(definition, parameters.stages, parameters.filters);

                release = await this.releaseHelper.getLastRelease(project.name!, definition.name!, definition.id!, parameters.stages, releaseFilter, 100);

                break;

            } case ReleaseType.Specific: {

                this.consoleLogger.log(`Targeting specific <${definition.name}> (${definition.id}) release pipeline release`);

                release = await this.releaseHelper.getRelease(project.name!, definition.id!, parameters.releaseName, parameters.stages);

                break;

            } default: {

                throw new Error(`Release type <${parameters.releaseType}> not supported`);

            }

        }

        debug(`Release <${release.name}> type <${ReleaseType[parameters.releaseType]}> created`);

        return release;

    }

}
