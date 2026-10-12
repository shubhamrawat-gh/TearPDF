# TearPDF tasks

- [x] Inspect empty workspace and initialize fresh Git history.
- [x] Audit pinned upstream source; record nine excluded trees and all 3,347 files under ignored .internal/.
- [x] Obtain owner's approval of exclusions before importing or removing application code.
- [x] Import the MIT core; strip excluded features and telemetry/update/cloud integrations.
- [x] Rebrand owned packages, assets, i18n and PDF metadata; preserve required licenses.
- [x] Implement the workspace, SQLite library, FTS, versions, rules, watched folders, jobs and pipelines.
- [x] Add local preferences, lock, certificate generator, notifications, demo data and custom-tool guide.
- [x] Pass full frontend/Java suites, clean builds and targeted checks.
- [x] Exercise real PDF tools, library/pipeline/watch/lock flows, both comparisons and a 220-page PDF.
- [x] Capture desktop/narrow screenshots in both themes; record browser network observations.
- [x] Write architecture, tool guide, changelog, README and verification report.
- [x] Confirm author, account and repository name; check availability before authorized private publication.

Owner: Shubham Rawat <shub.devx@gmail.com>. Repository target: shubhamrawat-gh/TearPDF.
The private repository publication is authorized; its actual result is returned in the final report after pushing.

Remaining requirements are tracked in [docs/VERIFICATION.md](docs/VERIFICATION.md): local OCR/office engines and Docker verification, arbitrary-tool pipelines, a recent export index, editable shortcuts, universal previews, complete picker preference integration and consolidation of inherited editor styling. External dependency namespaces retain their published names. The optional inherited formatter has a separate classloader issue.
