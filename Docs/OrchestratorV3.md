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

TBU

### Approval permissions

TBU

## How to use

TBU

### New run

TBU

### Latest run

TBU

### Specific run

TBU

## Advanced

TBU
