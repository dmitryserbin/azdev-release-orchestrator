/* eslint-disable @typescript-eslint/no-explicit-any */

import { VsoClient } from "azure-devops-node-api/VsoClient"
import { IRequestOptions, IRestResponse } from "typed-rest-client"

import { IDebug } from "../loggers/idebug"
import { ILogger } from "../loggers/ilogger"
import { IApiClient } from "./iapiclient"

export class ApiClient implements IApiClient {
	private debugLogger: IDebug

	private vsoClient: VsoClient

	constructor(vsoClient: VsoClient, logger: ILogger) {
		this.debugLogger = logger.extend(this.constructor.name)

		this.vsoClient = vsoClient
	}

	public async get<T>(path: string): Promise<T> {
		const debug = this.debugLogger.extend(this.get.name)

		const url: string = `${this.vsoClient.baseUrl}/${path}`

		debug(`Making <${url}> API <GET> call`)

		const response: IRestResponse<any> = await this.vsoClient.restClient.get(url)

		if (response.statusCode) {
			debug(`Response status code <${response.statusCode}> received`)
		}

		return response.result
	}

	public async post<T>(path: string, apiVersion?: string, body?: any): Promise<T> {
		const debug = this.debugLogger.extend(this.post.name)

		const url: string = `${this.vsoClient.baseUrl}/${path}`

		debug(`Making <${url}> API <POST> call`)

		const requestOptions: IRequestOptions = {}

		if (apiVersion) {
			requestOptions.acceptHeader = `api-version=${apiVersion}`
		}

		const response: IRestResponse<any> = await this.vsoClient.restClient.create(url, body, requestOptions)

		if (response.statusCode) {
			debug(`Response status code <${response.statusCode}> received`)
		}

		return response.result
	}

	// Ability to return raw response
	// As updateStage method requires
	// StatusCode for success validation
	public async patch<T>(path: string, apiVersion?: string, body?: any, raw?: boolean): Promise<T | IRestResponse<T>> {
		const debug = this.debugLogger.extend(this.patch.name)

		const url: string = `${this.vsoClient.baseUrl}/${path}`

		debug(`Making <${url}> API <PATCH> call`)

		const requestOptions: IRequestOptions = {}

		if (apiVersion) {
			requestOptions.acceptHeader = `api-version=${apiVersion}`
		}

		const response: IRestResponse<any> = await this.vsoClient.restClient.update(url, body, requestOptions)

		if (response.statusCode) {
			debug(`Response status code <${response.statusCode}> received`)
		}

		if (raw) {
			return response
		} else {
			return response.result
		}
	}

	public async put<T>(path: string, apiVersion?: string, body?: any): Promise<T> {
		const debug = this.debugLogger.extend(this.put.name)

		const url: string = `${this.vsoClient.baseUrl}/${path}`

		debug(`Making <${url}> API <PUT> call`)

		const requestOptions: IRequestOptions = {}

		if (apiVersion) {
			requestOptions.acceptHeader = `api-version=${apiVersion}`
		}

		const response: IRestResponse<any> = await this.vsoClient.restClient.replace(url, body, requestOptions)

		if (response.statusCode) {
			debug(`Response status code <${response.statusCode}> received`)
		}

		return response.result
	}

	public async delete<T>(path: string, apiVersion?: string): Promise<T> {
		const debug = this.debugLogger.extend(this.delete.name)

		const url: string = `${this.vsoClient.baseUrl}/${path}`

		debug(`Making <${url}> API <DELETE> call`)

		const requestOptions: IRequestOptions = {}

		if (apiVersion) {
			requestOptions.acceptHeader = `api-version=${apiVersion}`
		}

		const response: IRestResponse<any> = await this.vsoClient.restClient.del(url, requestOptions)

		if (response.statusCode) {
			debug(`Response status code <${response.statusCode}> received`)
		}

		return response.result
	}
}
