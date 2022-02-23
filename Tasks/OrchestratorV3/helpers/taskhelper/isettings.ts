export interface ISettings {

    updateInterval: number;
    stageStartAttempts: number;
    stageStartInterval: number;
    approvalInterval: number;
    approvalAttempts: number;
    cancelFailedCheckpoint: boolean;
    proceedSkippedStages: boolean;
    skipTracking: boolean;

}
