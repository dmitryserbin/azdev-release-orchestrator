# Release Orchestrator V3

- [Features](#features)
- [Prerequisites](#prerequisites)
  - [Pipeline permissions](#pipeline-permissions)
  - [Approval permissions](#approval-permissions)
- [How to use](#how-to-use)
  - [New run](#new-run)
  - [Latest run](#latest-run)
  - [Specific run](#specific-run)
- [Advanced](#advanced)

## Features

The **Release Orchestrator V3** task performs Azure DevOps [YAML](https://docs.microsoft.com/en-us/azure/devops/pipelines/get-started/pipelines-get-started) pipelines execution, progress monitoring, and provides various customization settings.

- Create new, target latest or specific run
- Target all or specific run stages
- Apply various run filters and controls
- Approve run stages and validate checks
- Track run progress and display results

## Prerequisites

To perform run orchestration the task uses one of two types of Azure DevOps [service endpoints](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints) to connect to the target pipelines. The service endpoint requires specific access to target project pipelines to be able to create and manage runs.

Type | Name | Account
---- | ---- | -------
`integrated` | SystemVssConnection | Project Collection Build Service
`service` | User specified | User specified

In order to use custom service endpoint, you may need to create a new Azure Pipelines [service connection](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints) using [personal access token](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate).

### Pipeline permissions

In pipelines security section of Azure DevOps project allow the following access to user account of the service endpoint:

Permission | Type
:--------- | :---
Queue builds | `Allow`
Stop builds | `Allow`
View build pipeline | `Allow`
View builds | `Allow`

Use `Project Collection Build Service` for integrated endpoint or user specified account for custom service endpoint. You can grant required permissions to all pipelines in the project or to a specific pipeline only.

Please refer to Azure DevOps [permissions and security roles documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/policies/permissions) for more details.

### Approval permissions

In order to enable automated stage approval the service endpoint user accunt needs to be added to the stage environment approval list.

- Add service endpoint user account to stage environment approvers
- Check `Allow approvers to approve their own runs`
- Set `Minimum number of approvals required` to `1`

In case the service endpoint user is not in the approval list or is not allowed to approve the run, manual approval is required and a warning is displayed in the run progress.

Please refer to Azure DevOps [approvals and gates documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/approvals) for more details.

## How to use

1. Add `Release Orchestrator` task to your pipeline
2. Select prefered Azure DevOps service endpoint type
3. Select target project and define target pipeline

You can choose different `strategy` to perform target pipeline run execution:

- `New run`: create new run
- `Latest run`: find and target latest run
- `Specific run`: find and target specific run

Every run strategy targets all stages in order configured in the pipeline (`new`) or in the run (`latest` or `specific`). To target specific stages only, define required stages using `stages` parameter. The target stages will be triggered in sequential order, exactly as specified.

```yaml
- task: releaseorchestrator@3
  displayName: Release Orchestrator
  inputs:
    # endpointType: service         # Optional. Options: integrated (default), service
    # endpointName: My-Endpoint     # Required when endpointType == service
    projectName: My-Project         # Required
    definitionName: My-Definition   # Required
    # strategy: new                 # Optional. Options: new (default), latest, specific
    # stages: DEV,TEST,PROD         # Optional
```

### New run

Create new run and target all stages in order configured in the pipeline or as specified in `stages` parameter.

```yaml
- task: releaseorchestrator@3
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    strategy: new
    # stages: DEV                   # Optional
    # branchName: my/branch/name    # Optional
    # parameters: |                 # Optional
    #   MyParameterOne=MyValueOne
    #   MyParameterTwo=MyValueTwo
```

### Latest run

Find latest run using filters and target all stages in order configured in the run or as specified in `stages` parameter.

```yaml
- task: releaseorchestrator@3
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    strategy: latest
    # stages: DEV                   # Optional
    # branchName: my/branch/name    # Optional
    # buildResult: Succeeded        # Optional. Options: Succeeded, PartiallySucceeded, Failed or Canceled
    # buildTags: My-Tag             # Optional
```

### Specific run

Find specific run by name and target all stages in order configured in the run or as specified in `stages` parameter.

```yaml
- task: releaseorchestrator@3
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    strategy: specific
    buildNumber: 20210518.1
    # stages: DEV                   # Optional
```

## Advanced

Parameter | Description
:-------- | :----------
`ignoreFailure` | Suppress progress errors and set task result to partially succeeded in case of a failure. Default = false
`skipTracking` | Skip target run stage progress tracking (i.e. do not wait for run to complete). Default = false
`cancelFailedCheckpoint` | Cancel run progress when stage approval or check fails. Default = false
`proceedSkippedStages` | Proceed as normal when targeting existing run with skipped stages or stages pending dependencies. Default = false
`updateInterval` | Number of seconds to wait before next run progress update. Default = 5 (seconds)
`approvalInterval` | Number of seconds to wait before next stage approval attempt. Default = 60 (seconds)
`approvalAttempts` | Number of attempts to retry approving target stage (if unsuccessful) before failing. Default = 10 (times)
