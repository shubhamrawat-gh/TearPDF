---
name: rust-tauri-standards
description: Use when writing or reviewing any Rust code in src-tauri/, including Tauri commands, image processing, PDF operations, or sidecar wrappers. Triggers on requests to implement, refactor, or review backend logic for this project.
---

Project: local-first PDF/image toolkit. Tauri 2.x + Rust backend, React/TS frontend. Core value is low resource use — treat that as a hard constraint, not a preference.

Memory rules:
- Never load an entire batch into memory at once. Stream file-by-file.
- For batch operations, use rayon for parallelism, but confirm RAM stays flat as batch size grows, not linear — if it climbs, something is buffering instead of streaming.
- Large image operations (30MP+) must not clone the buffer more than once.

Error handling:
- Never unwrap() or expect() on a Result in any #[tauri::command] — an unhandled panic in a Tauri command can crash the window.
- Every fallible operation returns a typed error via thiserror, not a raw String.
- Errors surfaced to the frontend must be specific enough for the user to understand what failed (e.g. "PDF is password-protected" not "operation failed").

Architecture:
- The PDF/image processing layer must be backend-agnostic. Commands should never assume Ghostscript or qpdf specifically — wrap each behind a trait so the backend is swappable without touching calling code.
- Keep #[tauri::command] functions thin: validate input, call into the engine module, map errors, return. No business logic in the command function itself.

Before implementing anything, state which of these rules apply to the current task and confirm the approach follows them. If a request conflicts with a rule (e.g. would require loading a full batch into memory), say so and propose the compliant alternative before writing code.
