# TearPDF — Master Technical Implementation & Future AI Roadmap Plan

This document outlines the master architecture, technical implementation plan, and multi-version roadmap for **TearPDF**. TearPDF is designed as a local-first, high-performance, low-resource desktop PDF & image processing toolkit powered by **Tauri 2.x, Rust, React, TypeScript, Tailwind CSS, Ghostscript, qpdf, and pdfium-render**.

---

## Executive Summary & Scalability Vision

TearPDF is engineered with a strict **three-tier evolutionary roadmap**:
1. **Version 1 (Core Desktop Toolkit)**: Rock-solid, local-first engine for high-speed PDF compression, splitting/merging, DPI manipulation, image conversion/resizing, and low-memory document previews. Zero cloud dependency, sub-80MB RAM footprint, strict sidecar security, and multi-core streaming batch processing.
2. **Version 2 (Automation Engine & Local Smart AI)**: On-device intelligence including local OCR (zero external server required), semantic vector search over documents using lightweight local embeddings (ONNX/Candle), automated document categorization, and event-driven folder watcher workflows (DAG execution).
3. **Version 3 (Multi-Modal AI Copilot & Enterprise Scalability)**: Pluggable AI engine supporting both local LLMs/VLMs (Ollama/LM Studio) and cloud APIs (OpenAI, Gemini, Claude), natural language document Q&A, automatic PII/sensitive data detection & structural redaction, headless CLI/daemon processing, and WebAssembly plugin extensions.

---

## 1. Architectural Principles & Safety Constraints

Adhering strictly to repository standards (`architecture-reviewer`, `rust-tauri-standards`, `sidecar-security`, and `edge-case-test-fixtures`):

### 1.1 Memory & Streaming Rules
- **Flat Memory Footprint**: Never buffer full file batches or multi-page PDFs into memory. All operations stream file-by-file or page-by-page.
- **Image Operations**: Large high-resolution images (30MP+) must limit buffer cloning to at most one single copy during transformation.
- **Preview Virtualization**: PDFium rasterization uses an LRU cache capped at <50MB RAM.

### 1.2 Sidecar Process Security
- **No Shell String Concatenation**: All sidecars (Ghostscript, qpdf) are invoked via explicit `Command::new().arg()` parameter arrays.
- **Untrusted Path & Content Validation**: Input file paths are checked for existence and verified via magic bytes (PDF header `%PDF-`, JPEG `\xFF\xD8\xFF`) before passing to sidecars. Argument flag injection (e.g. files named starting with `-`) is strictly blocked.
- **Scoped Temp Directory Guards**: All temporary files are created inside RAII auto-drop temporary directory guards (`tempfile` crate) ensuring zero residue on crash or failure.
- **Hard Execution Timeouts**: Sidecar processes operate under strict execution timeouts (default 120s) to prevent hung jobs from corrupt inputs.

### 1.3 Backend Abstraction (`ToolAdapter` Trait)
Commands remain thin wrapper handlers. Every tool operation implements the stateless `ToolAdapter` Rust trait:

```rust
pub async trait ToolAdapter: Send + Sync {
    fn id(&self) -> &'static str;
    async fn execute(
        &self, 
        input: PathBuf, 
        output: PathBuf, 
        params: serde_json::Value
    ) -> Result<JobResult, ToolkitError>;
}
```
This guarantees V1 tools plug directly into V2 workflow DAGs and V3 AI agent executors without changing a single line of core PDF/image logic.

---

## 2. Technology Stack & Layer Architecture

| Layer | Technology Choice | Function / Purpose |
| :--- | :--- | :--- |
| **Desktop Shell** | Tauri 2.x | Native OS WebView2 container (<80MB RAM idle, ~15MB binary). |
| **Frontend UI** | React 18 + TS + Vite + Tailwind CSS | Lovable warm parchment design system (`#f7f4ed`), responsive tools & real-time progress monitors. |
| **Image Core** | Pure Rust `image` + `kamadak-exif` | Fast image resizing (Lanczos3/CatmullRom), format conversion, quality compression & EXIF editing. |
| **PDF Compression** | Ghostscript (`gswin64c` sidecar) | Stream recompression, image downsampling (`-dPDFSETTINGS`), grayscale conversion. |
| **PDF Structure** | qpdf (`qpdf` sidecar) | Lossless merge, range split, page rotation, AES-256 encryption/decryption, xref repair, linearization. |
| **Preview Engine** | `pdfium-render` (Rust bindings) | On-demand low-memory page thumbnail rasterization. |
| **Batch Engine** | `rayon` + `tokio` channels | Parallel multi-core file pipeline with streaming memory safety. |
| **V2 Local AI Core** | `ort` (ONNX Runtime) / `candle` | Local OCR (RapidOCR/Tesseract) & local vector embedding generation (`all-MiniLM-L6-v2`). |
| **V3 AI Copilot** | Pluggable local/cloud adapter | Ollama, LM Studio, OpenAI, Anthropic, Google Gemini API integrations. |

---

## 3. Directory Blueprint

```
c:/Users/ACER/Desktop/Pdf/
├── implementation_plan.md       # Master implementation plan & AI roadmap
├── DESIGN.md                     # Lovable warm parchment design system specification
├── test-files/                   # Edge-case test fixtures (corrupt, password, huge, rotated, etc.)
├── src/                          # React Frontend
│   ├── assets/                   # App icons & graphics
│   ├── components/
│   │   ├── common/               # DropZone, FileCard, Header, ProgressBar, Button, Card
│   │   ├── tools/                # CompressPDF, MergeSplitPDF, DPITool, ResizeImages, RepairPDF
│   │   ├── preview/              # ComparisonPane, PdfThumbnailGrid
│   │   ├── batch/                # BatchQueue, QueueSummary
│   │   ├── automation/           # [V2] WorkflowBuilder, WatchFolderPanel
│   │   └── ai/                   # [V2/V3] DocumentChat, SmartRedact, SemanticSearch
│   ├── hooks/                    # useBatchQueue, useDragAndDrop, useTauriInvoke, useAIWorkflow
│   ├── lib/                      # tauri-bridge.ts, utils.ts
│   ├── stores/                   # useJobStore.ts, useSettingsStore.ts, useWorkflowStore.ts
│   ├── types/                    # ipc.ts, tools.ts, workflow.ts, ai.ts
│   ├── App.tsx                   # Main layout container & view routing
│   ├── index.css                 # Tailwind tokens & Lovable warm parchment theme
│   └── main.tsx                  # Entry point
├── src-tauri/
│   ├── src/
│   │   ├── main.rs               # Entry point & command registration
│   │   ├── commands/             # image_ops.rs, pdf_compress.rs, pdf_structure.rs, pdf_preview.rs, batch.rs, v2_ai.rs, v3_copilot.rs
│   │   ├── engine/               # adapter.rs, queue.rs, logger.rs, sidecar_resolver.rs, events.rs, security.rs
│   │   ├── adapters/             # ghostscript.rs, qpdf.rs, image_crate.rs, pdfium.rs, onnx_ocr.rs, vector_index.rs
│   │   └── models/               # errors.rs, ipc_payloads.rs, job.rs, workflow_dag.rs
│   ├── sidecars/                 # gs-x86_64-pc-windows-msvc.exe, qpdf-x86_64-pc-windows-msvc.exe, gsdll64.dll, pdfium.dll
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri permissions, sidecars & window layout
│   └── build.rs                  # Build script
├── package.json                  # NPM packages
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Design tokens
└── vite.config.ts                # Vite config
```

---

## 4. Multi-Phase Implementation Roadmap

### Phase 0: Workspace Setup & Lovable Parchment Scaffolding
- Scaffolding: Tauri 2.x React-TS app.
- Install frontend dependencies (`lucide-react`, `clsx`, `tailwind-merge`, `tailwindcss`, `@tauri-apps/api`, `@tauri-apps/plugin-shell`, `@tauri-apps/plugin-dialog`).
- Install backend crates (`image`, `kamadak-exif`, `rayon`, `pdfium-render`, `serde`, `tokio`, `thiserror`, `tracing`, `tempfile`).
- Configure `tailwind.config.js` with Lovable Warm Parchment Theme tokens (`#f7f4ed` background, `#1c1c1c` text, `#eceae4` warm borders, inset CTA button shadows, humanist variable typography).
- Initialize `test-files/` fixture repository (`corrupt.pdf`, `password.pdf`, `huge.jpg`, `tiny.png`, `rotated.pdf`, `mixed-sizes.pdf`, `text-only.pdf`).
- **Verification Gate**: `cargo tauri dev` boots cleanly with parchment background and zero warnings.

### Phase 1: Pure Rust Image Processing Engine
- Implement `src-tauri/src/adapters/image_crate.rs` adhering to `ToolAdapter`.
- Support formats: JPG, PNG, WebP, AVIF, TIFF, BMP, ICO.
- Spatial resampling (Lanczos3/CatmullRom) with single-buffer memory bounds for 30MP+ files.
- EXIF metadata handling & dual-mode DPI (Header tag update vs. True pixel resampling $W_{\text{px}} = W_{\text{in}} \times \text{DPI}$).
- **Verification Gate**: Unit tests pass for 100% of format conversions; zero unwraps; `huge.jpg` resizes under 150MB peak RAM.

### Phase 2: Ghostscript PDF Compression Engine
- Integrate Ghostscript sidecar in `src-tauri/sidecars/`.
- Implement `src-tauri/src/adapters/ghostscript.rs` using secure `Command` argument arrays.
- Presets: Screen (72 DPI), Ebook (150 DPI), Print (300 DPI), Grayscale, and custom JPEG compression ratios.
- Add file header validation & process execution timeouts.
- **Verification Gate**: Scanned PDF reduced by $\ge 50\%$; text-only PDF vector sharpness preserved; corrupt/password PDF returns typed `ToolkitError::PasswordProtected` error.

### Phase 3: qpdf PDF Structure Engine
- Integrate qpdf sidecar in `src-tauri/sidecars/`.
- Implement `src-tauri/src/adapters/qpdf.rs` implementing `ToolAdapter`.
- Capabilities: `merge_pdfs`, `split_pdf` (ranges e.g. `1-5, 8, 10-end`), `rotate_pdf` (+90°, -90°, 180°), `encrypt_pdf`/`decrypt_pdf` (AES-256), `repair_pdf` (XRef reconstruction), and web linearization.
- **Verification Gate**: Round-trip encrypt/decrypt matches source; `corrupt.pdf` triggers graceful repair or detailed failure message.

### Phase 4: PDFium Preview Engine & Virtualized UI
- Implement `src-tauri/src/adapters/pdfium.rs` with LRU page rasterization cache (<50MB RAM limit).
- Build React components following `DESIGN.md`:
  - `Header`, `DropZone`, `FileCard`, `ProgressBar`.
  - Tool Views: `CompressPDF`, `MergeSplitPDF`, `ResizeImages`, `DPITool`, `RepairPDF`.
  - Virtualized thumbnail preview grid & `ComparisonPane` (before vs. after size/quality delta).
- **Verification Gate**: Render 100-page PDF thumbnails lazily without layout stutter; UI maintains 60 FPS scrolling.

### Phase 5: Rayon Multi-Core Batch Queue & Event Bus
- Implement `src-tauri/src/engine/queue.rs` using `rayon::par_iter()` and Tokio channel streaming.
- Emit structured real-time progress events (`JobStarted`, `JobProgress`, `JobCompleted`, `JobFailed`) to React UI.
- Support cooperative job cancellation via `tokio::sync::watch`.
- **Verification Gate**: 50 mixed files process in parallel; RAM peak remains <150MB; individual broken files in a batch fail gracefully without stopping valid files.

### Phase 6: Packaging, Security Audit & V1 Release
- Audit all sidecar calls against `sidecar-security` checklist.
- Build Windows installer (`cargo tauri build`).
- **Verification Gate**: Installer validated on clean Windows sandbox environment.

---

## 5. Version 2 Architecture: Local Automation Engine & Smart AI

```
V2 Architecture Overview
├── Local Smart AI (Zero Cloud / Privacy First)
│   ├── Local OCR Engine (ONNX Runtime / RapidOCR / Tesseract sidecar)
│   ├── Local Vector Embedding Engine (Candle / ONNX all-MiniLM-L6-v2)
│   ├── Local Document Index & Hybrid Search (SQLite vector extension / HNSW)
│   └── Smart Document Classifier (Auto-tagging invoices, receipts, contracts)
└── Event-Driven Workflow Automation Engine
    ├── Directory Watcher Trigger (notify-rs crate)
    ├── Workflow DAG Executor (Serial & parallel pipeline nodes)
    ├── Conditional Rule Evaluator (If size > X, if text contains Y, if scanned PDF)
    └── Automated File Action Chains (Rename, Compress, OCR, Move, Email export)
```

### 5.1 Local OCR & Text Extraction Engine
- **Technology**: ONNX Runtime Rust bindings (`ort` crate) with lightweight RapidOCR model or Tesseract sidecar.
- **Privacy & Performance**: 100% offline text extraction on CPU/GPU without sending sensitive documents to third-party APIs.
- **Functionality**: Extract searchable text layer from scanned PDFs, image-based documents, and receipts; generate searchable PDF/A files.

### 5.2 Local Semantic Vector Indexing & Search
- **Embedding Model**: Embedded `all-MiniLM-L6-v2` ONNX model (~80MB model size) generating 384-dimensional dense vectors.
- **Storage**: Embedded SQLite vector storage or memory-mapped HNSW index stored locally in app data.
- **Search Capability**: Instant semantic natural language search across local document library ("Find tax receipts from 2025 with software purchases").

### 5.3 Event-Driven Folder Watcher & Workflow Automation
- **Folder Monitoring**: Rust `notify` crate monitors user-designated watch folders for incoming PDFs/images.
- **DAG Execution Engine**: Users build graphical multi-step workflows in React UI (`WorkflowBuilder`):
  - Example: `Watch Folder ("Downloads")` $\rightarrow$ `Filter: Is PDF & Scanned` $\rightarrow$ `Action: Run Local OCR` $\rightarrow$ `Action: Compress (Ebook Preset)` $\rightarrow$ `Action: Auto-Rename ("{Date}_{Title}.pdf")` $\rightarrow$ `Move to ("Archive")`.
- **Rule Evaluator**: Evaluates file metadata, document type, size, and extracted text conditions.

---

## 6. Version 3 Architecture: Multi-Modal AI Copilot & Enterprise Architecture

```
V3 Architecture Overview
├── Pluggable AI Copilot Engine
│   ├── Local Provider Adapters (Ollama, LM Studio, LocalAI)
│   ├── Cloud Provider Adapters (OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini 1.5/2.0)
│   ├── Document Multi-Modal Parser (Vision LLM chart/diagram/table understanding)
│   └── Conversational PDF Workspace (Interactive chat, citations, summary generation)
├── Intelligent Security & Data Protection
│   ├── Auto-PII Detection Engine (NER for SSN, credit cards, emails, signatures)
│   └── True Structural Redaction (Vector stream redaction in qpdf, not black box overlays)
└── Enterprise & Extensibility Engine
    ├── Headless CLI & Sidecar Daemon Mode (Background server pipeline)
    └── WebAssembly Plugin Engine (Wasmtime sandbox for user custom processors)
```

### 6.1 Pluggable LLM/VLM Provider Engine
- **Unified Interface**: `AIAdapter` trait supporting both local offline LLMs (via Ollama/LM Studio HTTP API) and cloud AI endpoints (OpenAI, Anthropic, Gemini).
- **Multi-Modal Vision Analysis**: Feed rendered page images into Vision LLMs for complex table parsing, handwritten note extraction, and diagram analysis.
- **Conversational PDF Workspace**: Interactive sidebar pane for natural language document Q&A with exact page/bounding-box visual citations.

### 6.2 Intelligent Automated PII Detection & Structural Redaction
- **Detection**: Local Named Entity Recognition (NER) & regex patterns detect SSNs, phone numbers, credit card numbers, personal addresses, and signatures.
- **True Vector Redaction**: Integrates with qpdf/pdfium to permanently purge underlying vector text and image pixels underneath redaction bounds—preventing text highlight copy-paste leaks.

### 6.3 Headless CLI Daemon & WebAssembly Plugin Architecture
- **Headless Mode**: Command-line flag (`tearpdf-cli --watch /input --workflow compress-ocr`) allows headless deployment on servers or NAS devices.
- **WASM Plugin System**: Extensible plugin system powered by `wasmtime` allowing developers to write custom document transformers in Rust, C, or TypeScript compiled to WebAssembly.

---

## 7. User Review Required & Design Tradeoffs

> [!IMPORTANT]
> **Key Architecture Decisions for User Feedback**:
> 1. **V2 Local OCR Model Selection**: Proposed default is ONNX Runtime (`ort` crate) with RapidOCR for zero external dependencies, vs. defaulting to a Ghostscript/Tesseract sidecar binary. ONNX offers better cross-platform sandboxing.
> 2. **V3 AI Provider Strategy**: Local-first privacy default (Ollama API bridge) with optional cloud API key inputs (Gemini/OpenAI/Claude). User settings store will encrypt API keys via OS keyring (`keyring` crate).
> 3. **Sidecar Security Policy**: Sidecar binaries (Ghostscript, qpdf) are bundled statically in installer bundles and verified via SHA-256 hash checks at startup before execution.

---

## 8. Verification Matrix & Edge-Case Testing Plan

| Test Category | Command / Method | Target Condition / Expected Result |
| :--- | :--- | :--- |
| **Rust Safety & Lints** | `cargo clippy -- -D warnings` | Zero warnings; 0 instances of `unwrap()` or `expect()` in commands. |
| **Unit Testing** | `cargo test` | 100% pass across image conversion, PDF splitting/merging, and error handlers. |
| **Edge-Case Fixture: Corrupt PDF** | Run repair/split on `test-files/corrupt.pdf` | Triggers `ToolkitError::CorruptPdf` or auto-repairs cleanly without sidecar crash. |
| **Edge-Case Fixture: Password PDF** | Run compression on `test-files/password.pdf` | Returns `ToolkitError::PasswordProtected` with user prompt for password. |
| **Edge-Case Fixture: Huge Image** | Resize `test-files/huge.jpg` (30MP+) | Execution completes with peak RAM <150MB (streaming buffer). |
| **Batch Resilience** | 50 mixed files + 1 corrupt file in queue | 50 valid files complete successfully; broken file logs error independently. |
| **Frontend Build** | `npm run build` | Clean TypeScript compilation; Vite bundle size optimized. |
| **Tauri Package** | `cargo tauri build` | Windows `.msi` / `.exe` installer generated and tested in isolated environment. |
