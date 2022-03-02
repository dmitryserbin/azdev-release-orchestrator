# Release Orchestrator V2

- [Features](#features)
- [Prerequisites](#prerequisites)
  - [Pipeline permissions](#pipeline-permissions)
  - [Approval permissions](#approval-permissions)
- [How to use](#how-to-use)
  - [Create release](#create-release)
  - [Latest release](#latest-release)
  - [Specific release](#specific-release)
- [Advanced](#advanced)

## Features

The **Release Orchestrator V2** task performs [classic](https://docs.microsoft.com/en-us/azure/devops/pipelines/release) Azure DevOps release pipelines execution, progress monitoring, and provides various customization settings.

- Create new, deploy latest release or specific release
- Target specific release deployment stages
- Apply release deployment filters
- Track release progress and display results

## Prerequisites

To perform release orchestration the task uses one of two types of Azure DevOps [service endpoints](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints) to connect to the target pipelines. The service endpoint requires specific access to target project pipelines to be able to create and manage releases.

Type | Name | Account
---- | ---- | -------
`integrated` | SystemVssConnection | Project Collection Build Service
`service` | User specified | User specified

In order to use custom service endpoint, you may need to create a new Azure Pipelines [service connection](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints) using [personal access token](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate).

### Pipeline permissions

In release pipelines security section of Azure DevOps project allow the following access to user account of the service endpoint:

Permission | Type
:--------- | :---
Create releases | `Allow`
Edit release stage | `Allow`
Manage deployments | `Allow`
View release pipeline | `Allow`
View releases | `Allow`

Use `Project Collection Build Service` for integrated endpoint or user specified account for custom service endpoint. You can grant required permissions to all release pipelines in the project or to a specific release pipeline.

Please refer to Azure DevOps [permissions and security roles documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/policies/permissions) for more details.

### Approval permissions

In order to enable automated stage pre-deployment approval the service endpoint user account needs to be added to the stage approvers.

- Add `Project Collection Build Service` or user specified service endpoint user account to stage approvers
- Uncheck `The user requesting a release or deployment should not approve it` checkbox

In case service endpoint user is not in the approval list or is not allowed to approve the release, manual approval is required and a warning is displayed in the release pipeline progress.

Please refer to Azure DevOps [approvals and gates documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/approvals) for more details.

## How to use

1. Add `Release Orchestrator` task to your release pipeline
2. Select prefered Azure DevOps service endpoint type
3. Select target project and define target release definition

You can choose different `releaseStrategy` to perform target pipeline run execution:

- `Create release`: create new release using [default stage triggers](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/triggers?view=azure-devops#env-triggers) or target specific stages
- `Latest release`: find and re-deploy latest release from release definition
- `Specific release`: find and re-deploy specific release from release definition

```yaml
- task: releaseorchestrator@2
  displayName: Release Orchestrator
  inputs:
    # endpointType: service             # Optional. Options: integrated, service
    # endpointName: My-Endpoint         # Required when endpointType == service
    projectName: My-Project
    definitionName: My-Definition
    # releaseStrategy: create           # Optional. Options: create (default), latest, specific
```

### Create release

New release deployment uses default stage [triggers](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/triggers?view=azure-devops#env-triggers) configured in the target pipeline. In order to deploy specific stages, you need to specify target stages using `Filter definition stages` option.

```yaml
- task: releaseorchestrator@2
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    releaseStrategy: create
    # definitionStage: DEV,TEST,PROD    # Optional
    # artifactVersion: My-Build-01      # Optional
    # artifactTag: My-Artifact-Tag      # Optional
    # artifactBranch: refs/heads/master # Optional
    # releaseVariables: |               # Optional
    #  My-Variable-One=My-Value-One
    #  My-Variable-Two=My-Value-Two
```

- `Definition stage`: target release definition stage filter (comma separated)
- `Artifact version`: target release primary build type artifact version filter (i.e. build number, last 100 builds)
- `Artifact tag`: target release primary build type artifact tag filter (comma separated, last 100 builds)
- `Artifact branch`: target release primary artifact source branch filter. Supports build artifact (last 100 builds) or Git artifact
- `Release variables`: override target release pipeline variables when creating a new release. Specified release variables must be configured to be 'settable at release time'. In 'Name=Value' format, special characters supported, new line separated

### Latest release

Latest release deployment targets all stages configured in the target pipeline. In order to deploy specific stages, you need to specify target stages using `Filter release stages` option. The target stages will be re-deployed in sequential order, exactly as you specified. Search range is last 100 releases.

```yml
- task: releaseorchestrator@2
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    releaseStrategy: latest
    # releaseStage: DEV,TEST,PROD       # Optional
    # releaseTag: My-Release-Tag        # Optional
    # artifactVersion: My-Build-01      # Optional
    # artifactTag: My-Artifact-Tag      # Optional
    # artifactBranch: refs/heads/master # Optional
    # stageStatus: succeeded            # Optional
```

- `Release stage`: target release stage filter (comma separated)
- `Release tag`: target release tag filter (comma separated, last 100 releases)
- `Artifact version`: target release primary build type artifact version filter (i.e. build number, last 100 builds)
- `Artifact tag`: target release primary build type artifact tag filter (comma separated, last 100 builds)
- `Artifact branch`: target release primary artifact source branch filter. Supports build artifact (last 100 builds) or Git artifact
- `Stage status`: target release stage status filter (comma separated). Options: succeeded, partiallySucceeded, notStarted, rejected & canceled

### Specific release

Specific release deployment targets all stages configured in the target pipeline. In order to deploy specific stages, you need to specify target stages using `Filter release stages` option. The target stages will be re-deployed in sequential order, exactly as you specified. Search range is last 100 releases.

```yml
steps:
- task: releaseorchestrator@2
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    releaseStrategy: specific
    releaseName: My-Release
    # releaseStage: DEV,TEST,PROD       # Optional
```

- `Release name`: target release name or ID (shows last 25 releases)
- `Release stage`: target release stage filter (comma separated)

## Advanced

- `Ignore failures`: suppress errors and set task result to partially succeeded in case of a failure. Might be useful when it is expected for target pipeline to fail
- `Approval retries`: number of attempts to retry (with 1 minute delay) approving target release stage deployment (if unsuccessful) before failing. Set to `0` if you want to disable approval retry and stop immediately if approval fails
- `Update interval`: number of seconds to wait before next release deployment progress update. Might be useful for longer releases to help reducing number of calls to your Azure DevOps pipeline

```yaml
- task: releaseorchestrator@2
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    ignoreFailure: false                # Optional
    approvalRetry: 60                   # Required. Default: 60 (times)
    updateInterval: 5                   # Required. Default: 5 (seconds)
```

## Troubleshooting

To enable debug mode to help troubleshooting issues, set `DEBUG=release-orchestrator:*` pipeline [variable](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables) or turn on Azure DevOps pipelines [system diagnostics](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables?view=azure-devops&tabs=batch#run-a-release-in-debug-mode).
