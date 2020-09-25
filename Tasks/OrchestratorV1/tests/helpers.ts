import * as mr from "azure-pipelines-task-lib/mock-run";

export function MockInput(tmr: mr.TaskMockRunner, variables: string[]): void {

    variables.forEach((i) => {

        tmr.setInput(i, process.env[i] as string);

    });

}

export function MockEndpoint(tmr: mr.TaskMockRunner, type: string = "integrated", name: string = "SYSTEMVSSCONNECTION", account: string = "Integrated", token: string = "Integrated"): void {

    // Set inputs
    tmr.setInput("EndpointType", type);

    let tokenParameterName: string = "AccessToken";

    if (type === "service") {

        tmr.setInput("ConnectedService", name);
        tokenParameterName = "ApiToken";

    }

    // Set endpoint
    process.env[`ENDPOINT_URL_${name}`] = `https://dev.azure.com/${account}`;
    process.env[`ENDPOINT_AUTH_PARAMETER_${name}_${tokenParameterName}`] = token;

}

export function SetProcessVariables(variables: any): void {

    Object.keys(variables).forEach((i) => {

        process.env[i] = variables[i];

    });

}

export function ClearProcessVariables(variables: any): void {

    Object.keys(variables).forEach((i) => {

        delete process.env[i];

    });

}
