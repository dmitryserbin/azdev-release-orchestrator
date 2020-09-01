# Changelog

## 2.0.0

- Major code refactoring (TBU)
- Update task to use name parameters ([4](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/4), [43](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/43))
- Add latest release stage status filter support ([26](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/26))
- Add release variables support ([24](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/24))
- Make approval retries configurable ([23](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/23))

## 1.2.9

- Add partially succeeded release support ([#40](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/40))

## 1.2.8

- Address optional parameters issue

## 1.2.7

- Minor internal improvements

## 1.2.6

- Address get release status issue ([#31](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/31))

## 1.2.5

- Address partially succeeded status issue

## 1.2.4

- Add retry mechanism

## 1.2.3

- Increase max retries

## 1.2.2

- Switch to native retry mechanism

## 1.2.1

- Add debug mode support
- Minor improvements

## 1.2.0

- Add new release filters support
- Remove specific artifact support
- Improve task user interface
- Improve default endpoint support
- Increase retry & timeout

## 1.1.7

- Improve task parameters support

## 1.1.6

- Add release tag filter support
- Add artifact tag filter support
- Minor improvements & bugfixes ([#2](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/2))

## 1.1.5

- Improve ignoreFailure logic
- Minor improvements & bug fixes

## 1.1.3

- Add latest release artifact branch filter

## 1.1.2

- Address automated release detection issue

## 1.1.0

- Added 'Latest' release strategy ([#1](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/1))
- Major code refactor and minor bug fixes
- Addressed intermittent ECONNRESET issue
- Added unit and integration tests

## 1.0.0

- Create new or re-deploy existing release
- Target specific release deployment stages
- Filter release definition artifact version
- Track release progress and display results
