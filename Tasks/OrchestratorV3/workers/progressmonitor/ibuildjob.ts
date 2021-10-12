export interface IBuildJob {

    id: string,
    name: string,
    imageName: string,
    queueId: string,
    stageName: string,
    stageId: string,
    startTime: string,
    finishTime: string,
    stateData: {
        pendingDependencies: boolean,
        pendingChecks: boolean,
    },
    state: number,
    result: number,

}
