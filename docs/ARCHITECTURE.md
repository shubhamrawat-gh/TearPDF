# TearPDF architecture

TearPDF is a single Spring Boot process serving a bundled React, TypeScript, Vite and Mantine frontend. Java packages use `tearpdf.software`. The application binds to loopback by default. The development frontend proxies local API requests to port 8080.

The workspace replaces the application frame and reuses the existing Workbench, PDFium WebAssembly viewer, annotation engine, tool registry and tool panels. Inter, icons, PDFium, PDF.js resources and fonts are bundled. `frontend/editor/src/core/workspace/design-tokens.css` owns workspace theme tokens. The Files list is virtualized; the PDF engine lazily renders pages.

`LibraryStore` owns `data/library/library.sqlite` and immutable `objects/<sha256>.pdf` files. SQLite WAL, prepared statements and synchronized connection access protect the index. Documents reference append-only versions. Imports extract searchable text with PDFBox and update SQLite FTS5. Searchable OCR output is indexed when saved as a version. Classification uses editable local keywords, weighting filenames above document text. Low confidence documents appear in the review filter. Identical hashes reuse an indexed document. Restore appends a version and preserves the historical object.

`WorkspaceAutomation` persists pipelines and jobs in SQLite, dispatches allowlisted tools through the existing local HTTP API, and saves each step as a new version. A single worker limits memory use. Folder polling waits for stable size and modification time across two scans before import. Seen signatures persist across restarts. Interrupted runs are marked interrupted at startup. Notifications and daily pipeline counts come from SQLite.

`LocalAccessFilter` rejects nonlocal browser origins, applies a local-only Content Security Policy, blocks URL-import tools and enforces an optional local passcode. Passcodes use salted PBKDF2 verifiers; session tokens expire after twelve hours and are held in memory. Background dispatch uses a random credential generated per process. The lock controls app access; PDF objects are not encrypted at rest.

PDF tool availability depends on installed local binaries. OCR requires Tesseract and OCRmyPDF; office conversion and some image operations need their respective system engines. The Docker recipe installs the common engines during image construction. Runtime processing does not need dependency downloads. Timestamping is disabled until a user configures an HTTP(S) server; that explicit feature sends a document hash to the configured server.

Back up the complete `data/library` directory while the app is stopped, including SQLite and its object directory. Keep originals separately. Clearing browser storage does not erase the backend library, although unsaved browser edits can be lost.
