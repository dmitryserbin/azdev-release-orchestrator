/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { TaskMockRunner } from "azure-pipelines-task-lib/mock-run";

export function mockInput(taskRunner: TaskMockRunner, variables: string[]): void {

    variables.forEach((i) => {

        taskRunner.setInput(i, process.env[i] as string);

    });

}

export function mockEndpoint(taskRunner: TaskMockRunner, type: string, name: string, account: string, token: string): void {

    taskRunner.setInput("endpointType", type);

    let tokenParameterName: string = "AccessToken";

    if (type === "service") {

        taskRunner.setInput("endpointName", name);
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
