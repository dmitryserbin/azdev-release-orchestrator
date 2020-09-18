# Release Orchestrator

- [Overview](##overview)
- [Features](##features)
- [Prerequisites](##prerequisites)
- [How to use](##how-to-use)
- [Release strategy](##release-strategy)
- [Advanced](##advanced)
- [Support](##support)
- [See also](##see-also)

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

To perform release pipeline orchestration the task requires Azure DevOps service endpoint with specific access to target project pipelines to be able to create and manage releases.

There are two types of Azure DevOps [service endoints](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints) supported:

Type | Name | Account
---- | ---- | -------
`integrated` | SystemVssConnection | Project Collection Build Service
`specific` | User specified | User specified

You may need to check and update the following settings in Azure DevOps to utilize full potential of Release Orchestrator.

- Service endpoint pipelines permissions
- Deployment appoval gates configuration

### Service endpoint permissions

In release pipelines security section of Azure DevOps project allow the following access to user account of the service endpoint:

- Create releases
- Edit release stage
- Manage deployments
- View release pipeline
- View releases

![Image](Images/ro-02.png)

Please refer to Azure DevOps [permissions and security roles documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/policies/permissions) for more details.

### Approval gates configuration

The task can automate release stage pre-deployment approval, in order to configure it you need:

- Add Azure DevOps service endpoint user account to stage approvers
- Uncheck `The user requesting a release or deployment should not approve it` checkbox

![Image](Images/ro-03.png)

In case service endpoint user is not in the approval list or is not allowed to approve the release, manual approval is required and a warning is displayed in the release pipeline progress.

Please refer to Azure DevOps [approvals and gates documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/approvals) for more details.

## How to use

1. Add `Release Orchestrator` task to your release pipeline
2. Select `Integrated endpoint` or `Service endpoint` endpoint type
3. Select target project and release definition

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

> You may need to create a new Azure Pipelines [service connection](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints) using [PAT](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate) token.

## Release strategy

You can choose different strategy for orchestrator to perform target release deployment:

- `Create new release`: create new release using [default stage triggers](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/triggers?view=azure-devops#env-triggers) or target specific stages
- `Deploy latest release`: find and re-deploy latest active release from release definition (target specific stages only)
- `Deploy specific release`: find and re-deploy specific release from release definition (target specific stages only)

### Create release

By default, new release deployment uses default stage [triggers](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/triggers?view=azure-devops#env-triggers) configured in the target pipeline. In order to deploy specific or manual stages, you need to specify target stages using `Filter definition stages` option.

- `Filter definition stages`: target specific deployment stage(s) (comma separated) _(optional)_
- `Filter artifact version`: enable new release filtering (last 100 builds) by primary build artifact version name (i.e. build number) _(optional)_
- `Filter artifact tag`: enable new release filtering (last 100 builds) by primary build artifact tag (comma separated) _(optional)_
- `Filter artifact branch`: enable new release filtering (last 100 builds) by primary build artifact source branch name _(optional)_
- `Release variables`: override release variables of the target release pipeline when creating a new release _(optional)_. Specified release variables must be configured to be `settable at release time` in the release. Values in `Name=Value` format, special characters supported, new line separated

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
    # artifactTagName: My-Artifact # Required when artifactTagFilter == true
    # artifactBranchFilter: false # Optional
    # artifactBranchName: refs/heads/master # Required when artifactBranchFilter == true
    # releaseVariables: | # Optional
    #  My-Variable-One=My-Value-One
    #  My-Variable-Two=My-Value-Two
```

### Latest release

Deploying latest release requires you to provide target stages for deployment. The target stages will be re-deployed in sequential order, exactly as you specified. Search range is last 100 releases.

- `Filter release stages`: target specific deployment stage(s) (comma separated) _(optional)_
- `Filter release tag`: enable filtering target release by release pipeline tag (comma separated) _(optional)_
- `Filter artifact version`: enable new release filtering (last 100 builds) by primary build artifact version name (i.e. build number) _(optional)_
- `Filter artifact tag`: enable filtering target release by primary build artifact tag (comma separated) _(optional)_
- `Filter artifact branch`: enable filtering target release by primary artifact source branch name _(optional)_
- `Filter stage status`: enable filtering target release by stage deployment status (comma separated) _(optional)_. Supported options: succeeded, partiallySucceeded, notStarted, rejected, canceled.

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
    # releaseTagName: My-Release # Required when releaseTagFilter == true
    # artifactVersionFilter: false # Optional
    # artifactVersionName: My-Build-01 # Required when artifactVersionFilter == true
    # artifactTagFilter: false # Optional
    # artifactTagName: My-Artifact # Required when artifactTagFilter == true
    # artifactBranchFilter: false # Optional
    # artifactBranchName: refs/heads/master # Required when artifactBranchFilter == true
    # stageStatusFilter: false # Optional
    # stageStatusName: Rejected,Succeeded # Required when stageStatusFilter == true
```

### Specific release

Deploying specific release requires you to provide target stages for deployment. The target stages will be re-deployed in sequential order, exactly as you specified.

- `Release name`: select existing release to target
- `Release ntages`: specify release deployment stage(s) (comma separated)

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

- `Ignore failures`: suppress errors and set task result to partially succeeded in case of failure. Might be useful when it is expected for target pipeline to fail
- `Approval fetries`: number of attempts to retry (with 1 minute delay) approving target release stage deployment (if unsuccessful) before failing. Set to `0` if you want to disable approval retry and stop immediately if approval fails
- `Update interval`: number seconds to wait before next release deployment progress update (i.e. every `X` seconds). Might be useful for longer releases to help reducing number of calls to your Azure DevOps pipeline

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
