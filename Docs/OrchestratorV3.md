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

You can choose different strategy to perform target pipeline run execution:

- `New run`: create new run
- `Latest run`: find and target latest run
- `Specific run`: find and target specific run

```yaml
- task: releaseorchestrator@3
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    strategy: new
    stages: DEV
```

### New run

TBU

### Latest run

TBU

### Specific run

TBU

## Advanced

TBU
