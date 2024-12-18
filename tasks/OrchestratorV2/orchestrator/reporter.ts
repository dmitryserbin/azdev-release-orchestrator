/* eslint-disable @typescript-eslint/no-explicit-any */

import Table from "cli-table"
import Moment from "moment"

import { ApprovalStatus, DeploymentReason, EnvironmentStatus, Release, ReleaseTask, TaskStatus } from "azure-devops-node-api/interfaces/ReleaseInterfaces"

import { IDebugLogger } from "../interfaces/loggers/idebuglogger"
import { IDebugCreator } from "../interfaces/loggers/idebugcreator"
import { IReporter } from "../interfaces/orchestrator/ireporter"
import { IReleaseProgress } from "../interfaces/common/ireleaseprogress"
import { IStageProgress } from "../interfaces/common/istageprogress"
import { ReleaseStatus } from "../interfaces/common/ireleasestatus"
import { IFilters } from "../interfaces/task/ifilters"
import { IReleaseVariable } from "../interfaces/common/ireleasevariable"

export class Reporter implements IReporter {
	private debugLogger: IDebugLogger

	constructor(debugCreator: IDebugCreator) {
		this.debugLogger = debugCreator.extend(this.constructor.name)
	}

	public getReleaseProgress(releaseProgress: IReleaseProgress): string {
		const table: Table = this.newTable(["ID", "Release", "Status", "Summary"])

		const releaseResult: any[] = this.newReleaseResult(releaseProgress)

		table.push(releaseResult)

		return table.toString()
	}

	public getStagesProgress(stagesProgress: IStageProgress[]): string {
		const table: Table = this.newTable(["ID", "Stage", "Type", "Release", "Tasks", "Attempt", "Approval", "Status", "Duration"])

		for (const stage of stagesProgress) {
			const stageResult: any[] = this.newStageResult(stage)

			table.push(stageResult)
		}

		return table.toString()
	}

	public getStageProgress(stageProgress: IStageProgress): string {
		const table: Table = this.newTable(["Agent", "Phase", "Task", "Status", "Duration"])

		for (const phase of stageProgress.deployment!.releaseDeployPhases!) {
			for (const job of phase.deploymentJobs!) {
				for (const task of job.tasks!) {
					const taskResult: any[] = this.newTaskResult(phase.name!, task)

					table.push(taskResult)
				}
			}
		}

		return table.toString()
	}

	public getRelease(release: Release, targetStages: string[]): string {
		const table: Table = this.newTable(["ID", "Name", "Stages", "Created By", "Created On"])

		// Highlight target stages in the release stages
		const releaseStages: (string | undefined)[] = release.environments!.map((stage) => {
			const targetStage: boolean = targetStages.includes(stage.name!)

			return targetStage ? `${stage.name}*` : stage.name
		})

		const releaseDate: Date | undefined = release.createdOn ? new Date(release.createdOn!) : undefined

		table.push([
			release.id ? release.id.toString() : "-",
			release.name ? release.name.toString() : "-",
			releaseStages ? releaseStages?.join("|") : "-",
			release.createdBy?.displayName ? release.createdBy.displayName : "-",
			releaseDate ? `${releaseDate.toLocaleDateString()} at ${releaseDate.toLocaleTimeString()}` : "-",
		])

		return table.toString()
	}

	public getFilters(filters: IFilters): string {
		const table: Table = this.newTable(["Release tag", "Artifact version", "Artifact tag", "Artifact branch", "Stage status"])

		const result: any[] = this.newFiltersResult(filters)

		table.push(result)

		return table.toString()
	}

	public getVariables(variables: IReleaseVariable[]): string {
		const table: Table = this.newTable(["Variable", "Value"])

		for (const variable of variables) {
			const result: any[] = this.newVariableResult(variable)

			table.push(result)
		}

		return table.toString()
	}

	private newReleaseResult(releaseProgress: IReleaseProgress): any[] {
		const result: any[] = [
			releaseProgress.id ? releaseProgress.id : "-",
			releaseProgress.name ? releaseProgress.name : "-",
			releaseProgress.status ? ReleaseStatus[releaseProgress.status] : "-",
			releaseProgress.url ? releaseProgress.url : "-",
		]

		return result
	}

	private newStageResult(stage: IStageProgress): any[] {
		const tasksCount: number = this.getTasksCount(stage)

		const result: any[] = [
			stage.id ? stage.id : "-",
			stage.name ? stage.name : "-",
			stage.deployment!.reason ? DeploymentReason[stage.deployment!.reason] : "-",
			stage.release ? stage.release : "-",
			tasksCount > 0 ? tasksCount : "-",
			stage.deployment!.attempt ? stage.deployment!.attempt : "-",
			stage.approval.status ? ApprovalStatus[stage.approval.status] : "-",
			stage.status ? EnvironmentStatus[stage.status] : "-",
			stage.duration ? Moment.duration(stage.duration, "minute").humanize() : "-",
		]

		return result
	}

	private newTaskResult(phaseName: string, task: ReleaseTask): any[] {
		const result: any[] = [
			task.agentName ? task.agentName : "-",
			phaseName,
			task.name ? task.name : "-",
			task.status ? TaskStatus[task.status] : "-",
			task.startTime && task.finishTime ? Moment.duration(new Date(task.startTime).getTime() - new Date(task.finishTime).getTime()).humanize() : "-",
		]

		return result
	}

	private newFiltersResult(filters: IFilters): any[] {
		const result: any[] = [
			filters.releaseTags.length ? filters.releaseTags?.join("|") : "-",
			filters.artifactVersion ? filters.artifactVersion : "-",
			filters.artifactTags.length ? filters.artifactTags?.join("|") : "-",
			filters.artifactBranch ? filters.artifactBranch : "-",
			filters.stageStatuses.length ? filters.stageStatuses?.join("|") : "-",
		]

		return result
	}

	private newVariableResult(variable: IReleaseVariable): any[] {
		const maskedValue = this.maskString(variable.value)

		const result: any[] = [variable.name, maskedValue]

		return result
	}

	private getTasksCount(stage: IStageProgress): number {
		const tasks: ReleaseTask[] = []

		stage.deployment!.releaseDeployPhases!.forEach((phase) => phase.deploymentJobs!.forEach((job) => job.tasks!.forEach((task) => tasks.push(task))))

		return tasks.length
	}

	private newTable(headers: string[], widths: number[] = []): Table {
		const options: any = {
			head: headers,
			widths,
		}

		const table: Table = new Table(options)

		return table
	}

	private maskString(input: string, character: string = "*", leading: number = 1, trailing: number = 1): string {
		let totalLenght: number = input.length
		let maskedLength: number
		let maskedBuffer: string = ""

		maskedBuffer = maskedBuffer.concat(input.substring(0, leading))

		if (totalLenght > trailing + leading) {
			maskedLength = totalLenght - (trailing + leading)

			for (let i = 0; i < maskedLength; i++) {
				maskedBuffer += character
			}
		} else {
			maskedLength = 0

			totalLenght = trailing + leading
		}

		maskedBuffer = maskedBuffer.concat(input.substring(leading + maskedLength, totalLenght))

		return maskedBuffer.toString()
	}
}
