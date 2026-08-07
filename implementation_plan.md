# TearPDF — Implementation Plan

This document outlines the step-by-step technical implementation plan for **TearPDF**, a local, high-performance, low-resource desktop PDF & image processing toolkit using **Tauri 2.x, Rust, React, TypeScript, Tailwind CSS, Ghostscript, qpdf, and pdfium-render**.

---

## 1. Architecture & Technology Stack

| Layer | Technology Choice | Function / Purpose |
| :--- | :--- | :--- |
| **Desktop Shell** | Tauri 2.x | Native OS WebView2 container (<80MB RAM idle, ~10-15MB binary). |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS | Desktop UI based on Lovable warm parchment design system (`#f7f4ed`), tool components, state management & IPC bridge. |
| **Image Core** | Pure Rust `image` + `kamadak-exif` crates | Fast image resizing (Lanczos3), format conversion, quality compression & DPI editing. |
| **PDF Compression** | Ghostscript (`gswin64c` sidecar) | Stream recompression, image downsampling (`-dPDFSETTINGS`), grayscale conversion. |
| **PDF Structure** | qpdf (`qpdf` sidecar) | Lossless merge, range split, rotation, AES-256 encryption/decryption, xref repair, linearization. |
| **Preview Engine** | `pdfium-render` (Rust C-bindings) | On-demand low-memory page thumbnail rasterization. |
| **Batch Engine** | `rayon` (Rust data parallelism) | Parallel multi-core file pipeline with streaming memory safety. |

---

## 2. Directory Structure Blueprint

```
c:/Users/ACER/Desktop/Pdf/
├── implementation_plan.md       # Master implementation plan (this file)
├── DESIGN.md                     # Lovable-inspired design system specification
├── src/                          # React Frontend
│   ├── assets/                   # App icons & graphics
│   ├── components/
│   │   ├── common/               # DropZone, FileCard, Header, ProgressBar, Button, Card
│   │   ├── tools/                # CompressPDF, MergeSplitPDF, DPITool, ResizeImages, RepairPDF
│   │   ├── preview/              # ComparisonPane, PdfThumbnailGrid
│   │   ├── batch/                # BatchQueue, QueueSummary
│   │   └── diagnostics/          # DiagnosticsPanel
│   ├── hooks/                    # useBatchQueue, useDragAndDrop, useTauriInvoke
│   ├── lib/                      # tauri-bridge.ts, utils.ts
│   ├── stores/                   # useJobStore.ts, useSettingsStore.ts
│   ├── types/                    # ipc.ts, tools.ts
│   ├── App.tsx                   # Main layout container & view routing
│   ├── index.css                 # Tailwind tokens & Lovable warm parchment theme
│   └── main.tsx                  # Entry point
├── src-tauri/
│   ├── src/
│   │   ├── main.rs               # Entry point & command handlers
│   │   ├── commands/             # image_ops.rs, pdf_compress.rs, pdf_structure.rs, pdf_preview.rs, batch.rs, diagnostics.rs
│   │   ├── engine/               # adapter.rs, queue.rs, logger.rs, sidecar_resolver.rs, events.rs
│   │   ├── adapters/             # ghostscript.rs, qpdf.rs, image_crate.rs, pdfium.rs
│   │   └── models/               # errors.rs, ipc_payloads.rs, job.rs
│   ├── sidecars/                 # gs-x86_64-pc-windows-msvc.exe, qpdf-x86_64-pc-windows-msvc.exe, gsdll64.dll, pdfium.dll
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri permissions, sidecars & window layout
│   └── build.rs                  # Build script
├── package.json                  # NPM packages
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Design tokens (Lovable warm parchment theme)
└── vite.config.ts                # Vite config
```

---

## 3. Multi-Phase Implementation Roadmap

### Phase 0: Workspace Setup & Scaffolding
- Initialize Tauri 2.x app: `npm create tauri-app@latest ./ -- --template react-ts`
- Install dependencies:
  - Frontend: `lucide-react`, `clsx`, `tailwind-merge`, `tailwindcss`, `@tauri-apps/api`, `@tauri-apps/plugin-shell`, `@tauri-apps/plugin-dialog`
  - Backend: `image`, `kamadak-exif`, `rayon`, `pdfium-render`, `serde`, `tokio`, `thiserror`, `tracing`
- Configure `tailwind.config.js` and `src/index.css` with the **Lovable Warm Parchment Design System**:
  - Background: Cream (`#f7f4ed`), Off-White (`#fcfbf8`), Primary text (`#1c1c1c`), Muted text (`#5f5f5d`).
  - Warm neutral borders: Passive (`#eceae4`), Interactive (`rgba(28,28,28,0.4)`).
  - Inset shadow utilities: Primary dark button inset (`rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px`), focus glow (`rgba(0,0,0,0.1) 0px 4px 12px`).
  - Typography: Camera Plain Variable / humanist font family, display headlines with tight negative letter spacing (-1.5px to -0.9px).
  - Radius tokens: 4px, 6px (buttons/inputs), 12px (cards/image containers), 16px (sections), 9999px (full-pill action buttons/toggles).
- **Verification Gate**: Run `cargo tauri dev` and confirm blank window boots cleanly with cream `#f7f4ed` background and warm theme tokens.

### Phase 1: Pure Rust Image Engine
- Create `src-tauri/src/commands/image_ops.rs`:
  - Format conversion: JPG, PNG, WebP, AVIF, TIFF, BMP, ICO.
  - Spatial resizing: Lanczos3 / CatmullRom / Bicubic filters.
  - Quality compression & EXIF metadata stripping.
  - Dual-mode DPI:
    - **Metadata-only**: Update EXIF header tag without changing raw pixels.
    - **True Resampling**: Recalculate dimensions ($W_{\text{px}} = W_{\text{in}} \times \text{DPI}$) and resample.
- **Verification Gate**: `cargo test` passes for 100% of format conversions; 30MP+ high-resolution image resizes without panic.

### Phase 2: Ghostscript PDF Compression Engine
- Place `gswin64c.exe` in `src-tauri/sidecars/gs-x86_64-pc-windows-msvc.exe`.
- Register sidecar in `tauri.conf.json` (`bundle.externalBin`).
- Create `src-tauri/src/commands/pdf_compress.rs`:
  - Map presets: Screen (72 DPI), Ebook (150 DPI), Print (300 DPI).
  - Add custom JPEG quality & grayscale options.
- **Verification Gate**: Scanned PDF reduced by ≥50%; text PDF vector clarity preserved; password-protected PDF produces clean IPC error.

### Phase 3: qpdf PDF Structure Engine
- Place `qpdf.exe` in `src-tauri/sidecars/qpdf-x86_64-pc-windows-msvc.exe`.
- Create `src-tauri/src/commands/pdf_structure.rs`:
  - `merge_pdfs`: Lossless concatenation of page streams.
  - `split_pdf`: Page extraction by range (`1-5, 8, 10-end`).
  - `rotate_pdf`: Page rotation (+90°, -90°, 180°).
  - `encrypt_pdf` / `decrypt_pdf`: AES-256 password protection.
  - `repair_pdf`: Fix XRef tables & linearize for web.
- **Verification Gate**: Encrypt -> Decrypt round-trip produces valid original file; multi-page merge preserves landscape/portrait mix.

### Phase 4: PDFium Preview Engine & React UI
- Create `src-tauri/src/commands/pdf_preview.rs` using `pdfium-render`.
- Build UI components adhering strictly to `DESIGN.md`:
  - **Layout & Canvas**: Parchment cream background (`#f7f4ed`), fixed horizontal header, and generous vertical section padding.
  - **Cards & Tools (`FileCard`, `DropZone`, `CompressPDF`, `MergeSplitPDF`, `ResizeImages`, `DPITool`)**: Warm cream surface with `#eceae4` 12px rounded borders; no heavy drop-shadows.
  - **Buttons & Controls**:
    - Primary CTA: Dark charcoal (`#1c1c1c`) with signature multi-layer inset shadow, 6px radius, and `#fcfbf8` text.
    - Secondary/Outline: Transparent background, `1px solid rgba(28,28,28,0.4)` border, 6px radius.
    - Action Toggles & Icon Buttons: `9999px` full-pill radius with opacity transitions (0.5 to 0.8 active).
  - **Preview & Comparison (`ComparisonPane`, `PdfThumbnailGrid`)**: Virtualized thumbnail scrolling with LRU memory caching (<50MB RAM) and `1px solid #eceae4` image container borders.
- **Verification Gate**: Render 100-page PDF thumbnails lazily on scroll; UI maintains 60 FPS viewport rendering with high tactile responsiveness.

### Phase 5: Rayon Multi-Core Batch Queue
- Create `src-tauri/src/commands/batch.rs` leveraging `rayon::par_iter()`.
- Stream per-file progress events to React UI via Tauri channels (`app.emit("batch-progress", payload)`).
- Implement job cancellation token (`tokio::sync::watch`).
- **Verification Gate**: 50 mixed files process in parallel across all physical CPU cores; RAM peak stays <150MB.

### Phase 6: Packaging & Distribution
- Run `cargo tauri build` to generate standalone Windows `.msi` / `.exe` installer.
- **Verification Gate**: Test installer on a clean Windows machine without Node/Rust/Ghostscript pre-installed.

---

## 4. Verification Matrix

| Area | Command / Method | Expected Result |
| :--- | :--- | :--- |
| **Compilation** | `cargo check` | 0 errors, 0 warnings. |
| **Linting** | `cargo clippy` | 0 warnings on safety/unwraps. |
| **Unit Tests** | `cargo test` | All unit tests pass. |
| **Frontend Build** | `npm run build` | Clean TypeScript compilation. |
| **Tauri Packaging** | `cargo tauri build` | Standalone installer created in `target/release/bundle/`. |

---

## 5. Future Automation Architecture (Post-V1 Extension Blueprint)

> [!NOTE]
> **Scope Requirement**: Automation is **NOT** a V1 deliverable. However, V1 code and engine interfaces are strictly architected so that V2 automation can be plugged in without refactoring core PDF/image processing code.

### 5.1 System Decoupling Model

```
TearPDF Platform
│
├── Core Processing Engine (Version 1 - Implemented Now)
│   ├── PDF Engine (qpdf / Ghostscript)
│   ├── Image Engine (Rust image / exif)
│   ├── Preview Engine (pdfium-render)
│   ├── Batch Engine (Rayon Multi-Core Runner)
│   ├── Unified Tool Adapter Trait (ToolAdapter)
│   └── Event Bus (JobStarted, JobCompleted, JobFailed)
│
└── Automation Engine (Version 2 - Future Extension)
    ├── Workflow Engine & DAG Executor
    ├── Trigger Engine (Folder Watcher / Cron / Shortcut)
    ├── AI Actions & Multi-Step Pipelines
    └── Variables, Conditions & Local Rule Engine
```

### 5.2 Core V1 Safeguards for Seamless V2 Extension
To ensure future automation plugs in effortlessly:
1. **Unified `ToolAdapter` Interface**: Every tool (Compress, Split, Merge, Resize, DPI) implements a standard stateless Rust trait:
   ```rust
   pub async trait ToolAdapter: Send + Sync {
       fn id(&self) -> &'static str;
       async fn execute(&self, input: PathBuf, output: PathBuf, params: Value) -> Result<JobResult, ToolkitError>;
   }
   ```
   *The UI, Batch Queue, CLI, and future Automation Engine invoke this exact same interface.*
2. **Event-Driven Subscriptions**: V1 emits structured events (`JobStarted`, `JobProgress`, `JobCompleted`, `JobFailed`). Future automation engines or watch folder triggers subscribe to this event bus without altering core tool logic.
3. **Stateless Operations**: Core processing tools hold zero UI state. They accept inputs, execute, and return outputs deterministically.
