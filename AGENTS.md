# TearPDF contributor instructions

Build a private, offline, single-user PDF workspace. Read PRD.md and TASKS.md before changes.
Use fresh Git history; never add an upstream remote or co-authors. Keep secrets and .internal/ untracked.
Audit licenses and obtain the owner's approval before removing excluded upstream components or importing application code.
Preserve original license text and copyright notices. Keep attribution in LICENSE, the in-app Licenses page, and README Acknowledgements.
Reuse the existing frontend stack. Bundle assets locally; disable telemetry and network-dependent features by default.
Build and test after each major step. Record actual outcomes and unresolved limitations; do not claim unverified features.
Ask before destructive changes outside this workspace.

Owner: Shubham Rawat <shub.devx@gmail.com>. Target private repository: shubhamrawat-gh/TearPDF.
The initial nine-tree license exclusion was approved. See docs/VERIFICATION.md for known gaps and platform skips.
Use Java 25, build frontend before packaging, and keep formatting separate from compilation.
Keep test PDFs binary in Git. Public test-only certificate fixtures are not personal signing identities.
