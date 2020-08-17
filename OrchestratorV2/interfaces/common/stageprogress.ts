import { EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IStageApproval } from "./stageapproval";

export interface IStageProgress {

    id?: number;
    name: string;
    release?: string;
    approval: IStageApproval;
    status: EnvironmentStatus;
    duration?: string;

}
