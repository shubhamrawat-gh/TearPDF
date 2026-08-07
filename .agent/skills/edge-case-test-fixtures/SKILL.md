---
name: edge-case-test-fixtures
description: Use when writing tests for any feature, or when a phase is being marked complete and needs verification. Triggers on requests to test, verify, or validate PDF/image processing code.
---

This project maintains a fixed set of test fixtures in test-files/. Every phase must be tested against these same fixtures — do not improvise new edge cases per phase, and do not consider a feature done until it passes against all fixtures relevant to it.

Required fixtures (create if missing, in test-files/):
- corrupt.pdf — a PDF truncated mid-file (head -c 5000 on a real PDF)
- password.pdf — a password-protected PDF
- huge.jpg — a 30MP+ image
- tiny.png — a 16x16 image
- rotated.pdf — a PDF with at least one page rotated 90/180/270
- mixed-sizes.pdf — pages of different sizes/orientations in one file
- text-only.pdf — a PDF with no embedded images (compression should barely shrink this; if it shrinks a lot, something is destructively re-encoding text)

Testing standard per feature:
1. Unit test against known-good input — assert exact output properties (dimensions, DPI value, page count), not "it ran without error."
2. Run against every fixture relevant to that feature.
3. For any operation producing a PDF, open it programmatically after (e.g. re-parse with qpdf --check) to confirm validity — a file existing is not the same as a file being valid.
4. Confirm the UI does not freeze during a large-file operation (200+ page PDF or 50-image batch) — this checks the async wiring, not just correctness.
5. For batch operations, include one deliberately broken file in the batch and confirm it fails independently without blocking the rest.

If a fixture doesn't exist yet, create it and add it to test-files/ rather than testing against a one-off file that won't be reused next phase.
