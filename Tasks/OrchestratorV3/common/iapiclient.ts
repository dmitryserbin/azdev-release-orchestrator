/* eslint-disable @typescript-eslint/no-explicit-any */

import { IRestResponse } from "typed-rest-client";

export interface IApiClient {

    get<T>(path: string): Promise<T>;
    post<T>(path: string, apiVersion?: string, body?: any): Promise<T>;
    patch<T>(path: string, apiVersion?: string, body?: any, raw?: boolean): Promise<T | IRestResponse<T>>;
    put<T>(path: string, apiVersion?: string, body?: any): Promise<T>;
    delete<T>(path: string, apiVersion?: string): Promise<T>;

}
