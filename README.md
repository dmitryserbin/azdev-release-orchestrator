# Release Orchestrator

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
  - [Endpoint permissions](#endpoint-permissions)
  - [Approval permissions](#approval-permissions)
- [How to use](#how-to-use)
  - [Create release](#create-release)
  - [Latest release](#latest-release)
  - [Specific release](#specific-release)
- [Advanced](#advanced)
- [Support](#support)
- [See also](#see-also)

## Overview

This extension adds [Release Orchestrator](https://marketplace.visualstudio.com/items?itemName=dmitryserbin.release-orchestrator) task to easily execute and track progress of multiple release pipelines in Azure DevOps. You can use this task to orchestrate numerous pipelines and deploy microservices components in a specific order.

Extension | Build | Code
:-------|:-------|:-------
[![Extension](https://vsmarketplacebadge.apphb.com/version/dmitryserbin.release-orchestrator.svg)](https://marketplace.visualstudio.com/items?itemName=dmitryserbin.release-orchestrator) | [![Build](https://dev.azure.com/dmitryserbin/Orchestrator/_apis/build/status/Orchestrator-master)](https://dev.azure.com/dmitryserbin/Orchestrator/_build/latest?definitionId=6) | [![CodeFactor](https://www.codefactor.io/repository/github/dmitryserbin/azdev-release-orchestrator/badge)](https://www.codefactor.io/repository/github/dmitryserbin/azdev-release-orchestrator)

## Features

The **Release Orchestrator** task performs target Azure DevOps release pipeline execution and provides various customization settings.

![Image](Images/ro-01.png)

The task uses either **integrated** (SystemVssConnection) or **specific**  personal access token (PAT) Azure DevOps service endpoint to connect to project pipelines.

- Create new, deploy latest release or specific release
- Target specific release deployment stages
- Apply release deployment filters
- Track release progress and display results

## Prerequisites

To perform release pipeline orchestration the task requires Azure DevOps service endpoint with specific access to target project pipelines to be able to create and manage releases. There are two types of Azure DevOps [service endoints](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints) supported:

Type | Name | Account
---- | ---- | -------
`integrated` | SystemVssConnection | Project Collection Build Service
`service` | User specified | User specified

In order to use custom service endpoint, you may need to create a new Azure Pipelines [service connection](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints) using [PAT](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate) token.

### Release permissions

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

The task can automate release stage pre-deployment approval, in order to configure it you need update release definition stages settings:

- Add `Project Collection Build Service` or user specified service endpoint user account to stage approvers
- Uncheck `The user requesting a release or deployment should not approve it` checkbox

In case service endpoint user is not in the approval list or is not allowed to approve the release, manual approval is required and a warning is displayed in the release pipeline progress.

Please refer to Azure DevOps [approvals and gates documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/approvals) for more details.

## How to use

1. Add `Release Orchestrator` task to your release pipeline
2. Select `Integrated endpoint` or `Service endpoint` endpoint type
3. Select target project as well as target release definition

You can choose different strategy to perform target release deployment:

- `Create release`: create new release using [default stage triggers](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/triggers?view=azure-devops#env-triggers) or target specific stages
- `Latest release`: find and re-deploy latest release from release definition
- `Specific release`: find and re-deploy specific release from release definition

> Template: baseline task configuration

```yaml
- task: releaseorchestrator@2
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    # endpointType: service # Optional. Options: integrated, service
    # endpointName: My-Endpoint # Required when endpointType == service
```

### Create release

By default, new release deployment uses default stage [triggers](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/triggers?view=azure-devops#env-triggers) configured in the target pipeline. In order to deploy specific stages, you need to specify target stages using `Filter definition stages` option.

- `Filter definition stages`: target release definition stage name(s) (comma separated)
- `Filter artifact version`: target release primary build type artifact version name (i.e. build number, last 100 builds)
- `Filter artifact tag`: target release primary build type artifact tag name(s) (comma separated, last 100 builds)
- `Filter artifact branch`: target release primary artifact source branch name. Supports build artifact (last 100 builds) or Git artifact
- `Release variables`: override target release pipeline variables when creating a new release. Specified release variables must be configured to be 'settable at release time'. In 'Name=Value' format, special characters supported, new line separated

> Template: new release deployment with automated stage triggers

```yaml
- task: releaseorchestrator@2
  displayName: Create release (auto)
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    releaseStrategy: create
    # definitionStageFilter: false # Optional
    # definitionStageName: DEV,TEST,PROD # Required when definitionStageFilter == true
    # artifactVersionFilter: false # Optional
    # artifactVersionName: My-Build-01 # Required when artifactVersionFilter == true
    # artifactTagFilter: false # Optional
    # artifactTagName: My-Artifact-Tag # Required when artifactTagFilter == true
    # artifactBranchFilter: false # Optional
    # artifactBranchName: refs/heads/master # Required when artifactBranchFilter == true
    # releaseVariables: | # Optional
    #  My-Variable-One=My-Value-One
    #  My-Variable-Two=My-Value-Two
```

### Latest release

By default, latest release deployment targets all stages configured in the target pipeline. In order to deploy specific stages, you need to specify target stages using `Filter release stages` option. The target stages will be re-deployed in sequential order, exactly as you specified. Search range is last 100 releases.

- `Filter release stages`: target release stage name(s) (comma separated)
- `Filter release tag`: target release tag name(s) (comma separated, last 100 releases)
- `Filter artifact version`: target release primary build type artifact version name (i.e. build number, last 100 builds)
- `Filter artifact tag`: target release primary build type artifact tag name(s) (comma separated, last 100 builds)
- `Filter artifact branch`: target release primary artifact source branch name. Supports build artifact (last 100 builds) or Git artifact
- `Filter stage status`: target release stage status filter name(s) (comma separated). Options: succeeded, partiallySucceeded, notStarted, rejected & canceled

> Template: latest release deployment

```yml
- task: releaseorchestrator@2
  displayName: Latest release (manual)
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    releaseStrategy: latest
    # releaseStageFilter: false # Optional
    # releaseStageName: DEV,TEST,PROD # Required when releaseStageFilter == true
    # releaseTagFilter: false # Optional
    # releaseTagName: My-Release-Tag # Required when releaseTagFilter == true
    # artifactVersionFilter: false # Optional
    # artifactVersionName: My-Build-01 # Required when artifactVersionFilter == true
    # artifactTagFilter: false # Optional
    # artifactTagName: My-Artifact-Tag # Required when artifactTagFilter == true
    # artifactBranchFilter: false # Optional
    # artifactBranchName: refs/heads/master # Required when artifactBranchFilter == true
    # stageStatusFilter: false # Optional
    # stageStatusName: succeeded # Required when stageStatusFilter == true
```

### Specific release

By default, specific release deployment targets all stages configured in the target pipeline. In order to deploy specific stages, you need to specify target stages using `Filter release stages` option. The target stages will be re-deployed in sequential order, exactly as you specified. Search range is last 100 releases.

- `Filter release stages`: target release stage name(s) (comma separated)

> Template: specific release deployment

```yml
steps:
- task: releaseorchestrator@2
  displayName: Specific release (manual)
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    releaseStrategy: specific
    releaseName: My-Release
    releaseStageName: DEV,TEST,PROD
```

## Advanced

- `Ignore failures`: suppress errors and set task result to partially succeeded in case of a failure. Might be useful when it is expected for target pipeline to fail
- `Approval retries`: number of attempts to retry (with 1 minute delay) approving target release stage deployment (if unsuccessful) before failing. Set to `0` if you want to disable approval retry and stop immediately if approval fails
- `Update interval`: number of seconds to wait before next release deployment progress update. Might be useful for longer releases to help reducing number of calls to your Azure DevOps pipeline

> Template: advanced task configuration

```yaml
- task: releaseorchestrator@2
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    ignoreFailure: false # Optional
    approvalRetry: 60 # Required. Default: 60 (times)
    updateInterval: 5 # Required. Default: 5 (seconds)
```

## Support

For aditional information and support please refer to [project repository](https://github.com/dmitryserbin/azdev-release-orchestrator). To enable debug mode to help troubleshooting issues, please configure `DEBUG=release-orchestrator:*` custom release [variable](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables).

For help with Azure DevOps and release pipelines please refer to [official documentation](https://docs.microsoft.com/en-us/azure/devops).

## See also

- [Changelog](CHANGELOG.md)
- [Privacy policy](PRIVACY.md)
