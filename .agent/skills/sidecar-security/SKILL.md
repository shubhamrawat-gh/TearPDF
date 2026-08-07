---
name: sidecar-security
description: Use when writing or reviewing any code that spawns an external process (Ghostscript, qpdf, pdfium, or any Command::new call), or that handles file paths coming from user input or drag-and-drop.
---

This project shells out to Ghostscript and qpdf. That is a command injection surface if handled wrong — treat every external process call as security-sensitive.

Rules:
- Always build sidecar commands using argument arrays (Command::new(path).arg(x).arg(y)), never string concatenation or shell interpolation of any kind. If you find yourself building a shell string, stop and use .arg() instead.
- File paths from the frontend (drag-and-drop, file picker) are untrusted input. Validate they resolve to real files before passing to a sidecar — do not trust the extension, check actual file content/magic bytes where feasible.
- Never pass a filename directly as a flag value without confirming it can't be interpreted as a flag itself (e.g. a file literally named "-dNOPAUSE" fed as an argument).
- Sidecar processes must run with a timeout. A malformed or adversarial PDF should not be able to hang the process indefinitely.
- Temp files written during processing must go in a scoped temp directory and be cleaned up even if the operation fails — use a guard/drop pattern, not manual cleanup at the end of the happy path.

When reviewing any new sidecar call, explicitly check it against this list before approving it, and flag any deviation instead of silently fixing it.
