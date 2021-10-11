import { EnvironmentStatus, DeploymentAttempt } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IStageApproval } from "../workers/stageapprover/istageapproval";

export interface IStageProgress {

    name: string;
    id: string;
    approval: IStageApproval;
    status: EnvironmentStatus;
    build?: string;
    deployment?: DeploymentAttempt;
    duration?: string;

}
