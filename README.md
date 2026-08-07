# TearPDF

TearPDF is a high-performance, open-source local desktop application for PDF manipulation and image processing. Built with Tauri 2.x, Rust, and React 18, TearPDF executes all processing directly on local hardware without sending document streams to remote cloud servers.

---

## Architecture Overview

TearPDF combines native Rust performance with sandboxed sidecar CLI engines to deliver low-latency file operations under a bounded memory footprint.

- Front-End Framework: React 18, TypeScript, Tailwind CSS, Vite, Zustand
- Desktop Shell: Tauri 2.x (WebView2 on Windows, WebKitGTK on Linux, WKWebView on macOS)
- Core Backend Engine: Rust (Rayon parallel iterator framework, Tokio async runtime)
- Sidecar Processors: Ghostscript (PDF stream compression), qpdf (structural manipulations and repair), PDFium (page thumbnail rasterization)
- Security Model: Explicit argument array isolation, strict input path validation, magic byte verification, execution timeout guards

---

## Features

### Core Operations (Version 1)

1. PDF Stream Compression
   - Re-encodes vector streams and downsamples embedded images using Ghostscript.
   - Preset profiles: Screen (72 DPI), Ebook (150 DPI), Print (300 DPI), and Grayscale.
   - Configurable JPEG quality factor sliders.
   - Real-time compression telemetry showing exact before/after byte sizes and percentage reduction ratios.

2. PDF Structural Operations
   - Lossless Merge: Combines multiple PDF files into a single document stream without re-encoding.
   - Range Extraction: Extracts custom page ranges (for example, `1-5`, `8`, `10-end`).
   - Page Rotation: Applies 90, 180, or 270-degree rotation matrices to document pages.

3. PDF Cross-Reference Repair
   - Reconstructs corrupted byte offset trailer tables using qpdf structure analysis.
   - Linearizes documents for fast web viewing.

4. Pure Rust Image Resampling
   - Spatial image resizing powered by the `image` Rust crate with Lanczos3 filtering.
   - Preserves EXIF metadata headers during transformation.
   - Single-buffer streaming limits memory usage to under 50 MB even for 30 megapixel input files.
   - Supports output formats: WebP, PNG, JPEG, and AVIF.

5. Dual-Mode DPI Modifier
   - Header Mode: Updates density metadata tags without altering pixel dimensions.
   - Resample Mode: Recalculates physical pixel dimensions based on target DPI (72, 150, 300, 600 DPI).

6. PDFium Page Thumbnail Preview
   - Dynamically rasterizes PDF pages into base64 PNG thumbnail streams.
   - Virtualized page grid with an LRU cache capping memory footprint under 50 MB.

7. Rayon Multi-Core Batch Execution
   - Parallel batch runner executing file transformations across available CPU worker threads.
   - Real-time progress updates delivered to the user interface via Tauri IPC event channels.

---

## Sidecar Security Safeguards

TearPDF enforces multi-layered input validation to prevent command injection and unauthorized file access:

1. Parameter Array Isolation: Direct `Command::new().arg()` invocation without shell interpolation (`sh -c` or `cmd /c`).
2. Flag Injection Defense: Rejects any input filepath prefixed with hyphens (`-`).
3. Magic Byte Header Verification: Validates initial byte signatures (`%PDF-`, `\xFF\xD8\xFF`, `\x89PNG`) before launching sidecar binaries.
4. Execution Timeouts: Wraps all external sidecar executions in 120-second timeout futures.

---

## Future AI & Automation Roadmap

### Version 2 (Local AI & Automations)
- Local OCR Engine: Searchable PDF text layer creation using ONNX Runtime (`ort` crate) and embedded RapidOCR models.
- Local Vector Search: Semantic document library search using 384-dimensional dense vectors (`all-MiniLM-L6-v2`) stored in local SQLite vector tables.
- Workflow Automation: Directory watcher triggers (`notify` crate) driving multi-step action pipelines.

### Version 3 (Multi-Modal AI Copilot & Enterprise)
- Pluggable AI Copilot: Connectors for local LLM engines (Ollama) and cloud APIs.
- Structural PII Redaction: Named entity recognition for automated text masking and stream purging.
- WebAssembly Plugins: Sandbox execution environment for third-party extensions via `wasmtime`.

---

## Prerequisites & Installation

### System Requirements
- Node.js v18+
- Rust toolchain v1.75+
- Windows 10/11, macOS 12+, or Linux (x86_64 / arm64)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/shubhamrawat-gh/TearPDF.git
cd TearPDF
```

2. Install Node dependencies:
```bash
npm install
```

3. Run the development server in web mode:
```bash
npm run dev
```

4. Launch the native desktop app container:
```bash
npm run tauri dev
```

---

## Verification & Audit

Run the sidecar security audit script:
```bash
node scratch/audit_sidecar_security.mjs
```

Build the production bundle:
```bash
npm run build
```

Run Rust unit tests:
```bash
cargo test
```

---

## License

This project is licensed under the MIT License.
