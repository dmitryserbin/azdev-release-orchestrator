import * as ci from "azure-devops-node-api/interfaces/CoreInterfaces";
import * as ri from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import * as bi from "azure-devops-node-api/interfaces/BuildInterfaces";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ra from "azure-devops-node-api/ReleaseApi";
import * as ba from "azure-devops-node-api/BuildApi";

export enum ReleaseType {

    Undefined = "Undefined",
    Create = "Create",
    Specific = "Specific",
    Latest = "Latest"

}

export enum ReleaseStatus {

    Undefined = "Undefined",
    InProgress = "InProgress",
    Succeeded = "Succeeded",
    Failed = "Failed",

}

export interface IEndpoint {

    url: string;
    token: string;

}

export interface IParameters {

    releaseType: ReleaseType,
    projectId: string;
    definitionId: string;
    releaseId: string;
    stages: string[];
    releaseTag: string[];
    artifactTag: string[];
    sourceBranch: string;

}

export interface IConnection {

    getCoreApi(): Promise<ca.CoreApi>;
    getReleaseApi(): Promise<ra.ReleaseApi>;
    getBuildApi(): Promise<ba.BuildApi>;

}

export interface IReleaseDetails {

    endpointName: string;
    projectName: string;
    releaseName: string;
    requesterName: string;
    requesterId: string;

}

export interface IReleaseParameters {

    projectName: string;
    releaseId: number;
    releaseStages: string[];
    sleep: number;

}

export interface IApproveParameters {

    projectName: string;
    status: IStageApproval;
    retry: number;
    sleep: number;

}

export interface IStageApproval {

    status: ri.ApprovalStatus;
    count: number;

}

export interface IStageProgress {

    name: string;
    approval: IStageApproval;
    status: ri.EnvironmentStatus;
    id?: number;
    release?: string;
    
    isPending(): boolean;
    isCompleted(): boolean;

}

export interface IReleaseProgress {

    progress: IStageProgress[];
    url?: string;

    getPendingStages(): IStageProgress[];
    getIncompleted(): IStageProgress[];
    getStatus(): ReleaseStatus;
    validate(): void;
    display(): void;

}

export interface IReleaseFilter {

    artifactVersion?: string,
    sourceBranch?: string,
    tag?: string[],

}

export interface IOrchestrator {

    deployRelease(parameters: IParameters, details: IReleaseDetails): Promise<void>;
    getRelease(type: ReleaseType, project: ci.TeamProject, definition: ri.ReleaseDefinition, details: IReleaseDetails, parameters: IParameters): Promise<ri.Release>;

}

export interface IHelper {

    getProject(projectId: string): Promise<ci.TeamProject>;
    getDefinition(projectName: string, definitionId: number): Promise<ri.ReleaseDefinition>;
    getRelease(project: ci.TeamProject, releaseId: number, stages: string[]): Promise<ri.Release>;
    findRelease(projectName: string, definitionId: number, stages: string[], filter: IReleaseFilter): Promise<ri.Release>;
    createRelease(project: ci.TeamProject, definition: ri.ReleaseDefinition, details: IReleaseDetails, stages?: string[], artifacts?: ri.ArtifactMetadata[]): Promise<ri.Release>;
    findBuild(projectName: string, definitionId: number, tags?: string[]): Promise<bi.Build>;
    getArtifacts(projectName: string, definitionId: number, primaryId: string, versionId?: string, sourceBranch?: string): Promise<ri.ArtifactMetadata[]>;
    isAutomated(release: ri.Release): Promise<boolean>;

}

export interface IDeployer {

    deployManual(parameters: IReleaseParameters, releaseDetails: IReleaseDetails): Promise<void>;
    deployAutomated(parameters: IReleaseParameters, releaseDetails: IReleaseDetails): Promise<void>;
    approveStage(stage: ri.ReleaseEnvironment, parameters: IApproveParameters, releaseDetails: IReleaseDetails): Promise<IStageApproval>;
    getReleaseStatus(projectName: string, releaseId: number): Promise<ri.Release>;
}
