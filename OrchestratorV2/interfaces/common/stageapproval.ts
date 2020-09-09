import { ApprovalStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

export interface IStageApproval {

    status: ApprovalStatus;
    retry: number;

}
