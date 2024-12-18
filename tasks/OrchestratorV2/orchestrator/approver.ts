import { ApprovalStatus, ReleaseApproval, ReleaseEnvironment } from "azure-devops-node-api/interfaces/ReleaseInterfaces"

import { IApprover } from "../interfaces/orchestrator/iapprover"
import { IStageProgress } from "../interfaces/common/istageprogress"
import { IDetails } from "../interfaces/task/idetails"
import { ISettings } from "../interfaces/common/isettings"
import { IDebugLogger } from "../interfaces/loggers/idebuglogger"
import { IConsoleLogger } from "../interfaces/loggers/iconsolelogger"
import { ICommonHelper } from "../interfaces/helpers/icommonhelper"
import { IReleaseHelper } from "../interfaces/helpers/ireleasehelper"
import { IDebugCreator } from "../interfaces/loggers/idebugcreator"

export class Approver implements IApprover {
	private debugLogger: IDebugLogger
	private consoleLogger: IConsoleLogger

	private commonHelper: ICommonHelper
	private releaseHelper: IReleaseHelper

	constructor(commonHelper: ICommonHelper, releaseHelper: IReleaseHelper, debugCreator: IDebugCreator, consoleLogger: IConsoleLogger) {
		this.debugLogger = debugCreator.extend(this.constructor.name)
		this.consoleLogger = consoleLogger

		this.commonHelper = commonHelper
		this.releaseHelper = releaseHelper
	}

	public async approveStage(
		stageProgress: IStageProgress,
		stageStatus: ReleaseEnvironment,
		projectName: string,
		details: IDetails,
		settings: ISettings,
	): Promise<void> {
		const debug = this.debugLogger.extend(this.approveStage.name)

		// Increment retry count
		stageProgress.approval.retry++

		this.consoleLogger.log(`Approving <${stageProgress.name}> (${stageStatus.id}) stage deployment (retry ${stageProgress.approval.retry})`)

		const pendingApprovals: ReleaseApproval[] = await this.releaseHelper.getStageApprovals(stageStatus, ApprovalStatus.Pending)

		// Update approval status to skipped
		// When stage approval is not required
		if (pendingApprovals.length <= 0) {
			stageProgress.approval.status = ApprovalStatus.Skipped

			debug(`Stage <${stageStatus.name}> approval <${ApprovalStatus[stageProgress.approval.status]}> not required`)

			return
		}

		// Approve pending requests in sequence
		// To support multiple approvals scenarios
		for (const pendingApproval of pendingApprovals) {
			try {
				debug(pendingApproval)

				const approvalMessage: string = `Approved by <${details.releaseName}> (${details.endpointName}) via Release Orchestrator`

				// Approve stage deployment
				const approvalStatus: ReleaseApproval = await this.releaseHelper.approveStage(pendingApproval, projectName, approvalMessage)

				// Update stage approval status
				stageProgress.approval.status = approvalStatus.status!

				// No need to approve following request
				// When at least one approval succeeded
				if (approvalStatus.status === ApprovalStatus.Approved) {
					this.consoleLogger.log(`Stage <${stageStatus.name}> (${stageStatus.id}) approved successfully`)

					break
				}
			} catch {
				stageProgress.approval.status = ApprovalStatus.Rejected
			}
		}

		debug(`Stage <${stageStatus.name}> approval status <${ApprovalStatus[stageProgress.approval.status]}> retrieved`)

		// Validate failed approvals retry attempts
		// Cancel stage deployment if unable to approve
		if (stageProgress.approval.status === ApprovalStatus.Rejected) {
			const retryLimit: boolean = stageProgress.approval.retry >= settings.approvalRetry

			if (retryLimit) {
				const limitMinutes: number = Math.floor((settings.approvalRetry * settings.approvalSleep) / 60000)
				const cancelMessage: string = "Approval waiting time limit exceeded"

				this.consoleLogger.warn(`Stage <${stageStatus.name}> (${stageStatus.id}) approval <${limitMinutes}> minute(s) time limit exceeded`)

				debug(`Cancelling <${stageStatus.name}> (${stageStatus.id}) stage deployment`)

				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const releaseStage: ReleaseEnvironment = await this.releaseHelper.cancelStage(stageStatus, projectName, cancelMessage)
			} else {
				this.consoleLogger.warn(`Stage <${stageStatus.name}> (${stageStatus.id}) cannot be approved by <${details.releaseName}> (${details.endpointName})`)

				// Wait before next approval retry
				await this.commonHelper.wait(settings.approvalSleep)
			}
		}
	}

	public async isStageApproved(stageProgress: IStageProgress, stageStatus: ReleaseEnvironment): Promise<boolean> {
		const debug = this.debugLogger.extend(this.isStageApproved.name)

		const pendingApprovals: ReleaseApproval[] = await this.releaseHelper.getStageApprovals(stageStatus, ApprovalStatus.Pending)

		// Confirming both pending approvals and current approval status
		// To avoid false negative results when deploying new release
		const approved: boolean =
			pendingApprovals.length <= 0 && stageProgress.approval.status !== ApprovalStatus.Pending && stageProgress.approval.status !== ApprovalStatus.Rejected

		debug(`Stage <${stageProgress.name}> (${ApprovalStatus[stageProgress.approval.status]}) approval <${approved}> status`)

		return approved
	}
}
