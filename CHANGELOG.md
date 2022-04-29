# Changelog

## 3.0.*

`2022-04-30`

- Fixed BuildTags parameter not assigned ([72](https://github.com/dmitryserbin/azdev-release-orchestrator/pull/72))

`2022-03-02`

- Introduce V3 with YAML pipelines support ([68](https://github.com/dmitryserbin/azdev-release-orchestrator/pull/68))

## 2.0.*

`2022-03-03`

- Add Azure DevOps pipelines system diagnostics support ([70](https://github.com/dmitryserbin/azdev-release-orchestrator/pull/70))

`2021-02-15`

- Improve release status retry mechanism ([60](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/60))

`2021-01-29`

- Update packages & minor logging improvements ([61](https://github.com/dmitryserbin/azdev-release-orchestrator/pull/61))

`2021-01-21`

- Use default release pipeline artifact version ([59](https://github.com/dmitryserbin/azdev-release-orchestrator/pull/59))

`2020-09-30`

- Address on-prem Azure DevOps task endpoint issue ([53](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/53))
- Add `succeededWithIssues` status suppress support

`2020-09-25`

- Major code refactoring & improvements
- Update documentation & add privacy policy
- Update task to use name parameters ([4](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/4), [43](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/43))
- Make task parameters optional & update naming
- Add artifact version filter support ([47](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/47))
- Add latest & specific optional release stage filter
- Add latest release stage status filter support ([26](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/26))
- Add release variables support ([24](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/24))
- Make approval retries configurable ([23](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/23))

---

## 1.2.*

`2020-08-10`

- Add partially succeeded release support ([#40](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/40))

`2020-02-02`

- Address optional parameters issue

`2020-01-31`

- Minor internal improvements

`2020-01-20`

- Address get release status issue ([#31](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/31))

`2019-06-28`

- Address partially succeeded status issue

`2019-06-09`

- Add retry mechanism

`2019-05-13`

- Increase max retries

`2019-03-31`

- Switch to native retry mechanism

`2019-03-21`

- Add debug mode support
- Minor improvements

`2019-03-20`

- Add new release filters support
- Remove specific artifact support
- Improve task user interface
- Improve default endpoint support
- Increase retry & timeout

---

## 1.1.*

`2019-03-11`

- Improve task parameters support

`2019-03-11`

- Add release tag filter support
- Add artifact tag filter support
- Minor improvements & bugfixes ([#2](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/2))

`2019-02-18`

- Improve ignoreFailure logic
- Minor improvements & bug fixes

`2019-02-15`

- Add latest release artifact branch filter

`2019-02-07`

- Address automated release detection issue

`2019-01-24`

- Added latest release strategy ([#1](https://github.com/dmitryserbin/azdev-release-orchestrator/issues/1))
- Major code refactor and minor bug fixes
- Addressed intermittent ECONNRESET issue
- Added unit and integration tests

---

## 1.0.*

`2018-12-19`

- Create new or re-deploy existing release
- Target specific release deployment stages
- Filter release definition artifact version
- Track release progress and display results
