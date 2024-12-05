# Release Orchestrator

- [Overview](#overview)
- [Features](#features)
- [How to use](#how-to-use)
- [Support](#support)
- [References](#references)

## Overview

This extension adds [Release Orchestrator](https://marketplace.visualstudio.com/items?itemName=dmitryserbin.release-orchestrator) tasks to execute and track progress of Azure DevOps pipelines. You can use the tasks to trigger one or multiple pipelines across projects to orchestrate build and deployment of application components in a specific order.

Extension | Build | Code
:---------|:------|:----
[![Extension](https://vsmarketplacebadges.dev/version/dmitryserbin.release-orchestrator.svg)](https://marketplace.visualstudio.com/items?itemName=dmitryserbin.release-orchestrator) | [![CI](https://github.com/dmitryserbin/azdev-release-orchestrator/actions/workflows/ci.yml/badge.svg)](https://github.com/dmitryserbin/azdev-release-orchestrator/actions/workflows/ci.yml) | [![CodeFactor](https://www.codefactor.io/repository/github/dmitryserbin/azdev-release-orchestrator/badge)](https://www.codefactor.io/repository/github/dmitryserbin/azdev-release-orchestrator)

## Features

The **Release Orchestrator** tasks perform classic or YAML pipeline execution, progress monitoring, and provide various customization settings.

Task | Description
:-------|:-----------
[Release Orchestrator V3](docs/OrchestratorV3.md) | Execute and monitor [YAML](https://docs.microsoft.com/en-us/azure/devops/pipelines/get-started/pipelines-get-started) pipelines
[Release Orchestrator V2](docs/OrchestratorV2.md) | Execute and monitor [classic](https://docs.microsoft.com/en-us/azure/devops/pipelines/release) release pipelines

## How to use

1. Add `Release Orchestrator` task to your pipeline
2. Select prefered Azure DevOps service endpoint type
3. Select target project and define target pipeline

> Release Orchestrator V3 task (target YAML pipeline), please refer to task [version 3 documentation](docs/OrchestratorV3.md) for more details.

```yaml
- task: releaseorchestrator@3
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    strategy: new
    stages: DEV
```

> Release Orchestrator V2 task (target classic pipeline), please refer to task [version 2 documentation](docs/OrchestratorV2.md) for more details.

```yaml
- task: releaseorchestrator@2
  displayName: Release Orchestrator
  inputs:
    projectName: My-Project
    definitionName: My-Definition
    releaseStrategy: create
    definitionStage: DEV
```

## Support

For aditional information and support please refer to [project repository](https://github.com/dmitryserbin/azdev-release-orchestrator). For help with Azure DevOps and release pipelines please refer to [official documentation](https://docs.microsoft.com/en-us/azure/devops).

## References

- [Changelog](CHANGELOG.md)
- [Privacy policy](PRIVACY.md)
- [License](LICENSE)
