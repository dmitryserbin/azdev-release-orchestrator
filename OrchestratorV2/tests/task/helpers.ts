import * as mr from "azure-pipelines-task-lib/mock-run";

export function mockInput(taskRunner: mr.TaskMockRunner, variables: string[]): void {

    variables.forEach((i) => {

        taskRunner.setInput(i, process.env[i] as string);

    });

}

export function mockEndpoint(taskRunner: mr.TaskMockRunner, type: string, name: string, account: string, token: string): void {

    taskRunner.setInput("EndpointType", type);

    let tokenParameterName: string = "AccessToken";

    if (type === "service") {

        taskRunner.setInput("ConnectedService", name);
        tokenParameterName = "ApiToken";

    }

    process.env[`ENDPOINT_URL_${name}`] = `https://dev.azure.com/${account}`;
    process.env[`ENDPOINT_AUTH_PARAMETER_${name}_${tokenParameterName}`] = token;

}

export function setMockVariables(variables: any): void {

    Object.keys(variables).forEach((i) => {

        process.env[i] = variables[i];

    });

}

export function clearMockVariables(variables: any): void {

    Object.keys(variables).forEach((i) => {

        delete process.env[i];

    });

}
