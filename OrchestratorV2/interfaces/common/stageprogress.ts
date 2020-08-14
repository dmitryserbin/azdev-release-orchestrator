import { EnvironmentStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

import { IStageApproval } from "./stageapproval";

export interface IStageProgress {

    name: string;
    approval: IStageApproval;
    status: EnvironmentStatus;
    id?: number;
    release?: string;

}
