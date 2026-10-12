# TearPDF verification

Verified on Windows on 2026-10-12. This report distinguishes implemented behavior, reused tools and remaining requirements. A successful build does not certify every inherited PDF operation or every possible input file.

## License scope and removals

The owner approved the exclusion list before application source was imported. The root LICENSE is preserved byte-for-byte. Its lines 7–24 explicitly exclude the following trees from the MIT grant; each tree has its own restrictive license. None was imported.

| Excluded tree | Files |
| --- | ---: |
| `app/proprietary/` | 1,211 |
| `app/saas/` | 341 |
| `engine/` | 160 |
| `frontend/editor/src/proprietary/` | 561 |
| `frontend/editor/src/desktop/` | 279 |
| `frontend/editor/src/saas/` | 134 |
| `frontend/editor/src/cloud/` | 48 |
| `frontend/editor/src/portal/` | 572 |
| `frontend/editor/src/portal-saas/` | 41 |
| **Total** | **3,347** |

The per-file inventory and license hashes are retained in ignored `.internal/license-exclusions.csv` and `.internal/LICENSE-AUDIT.md`. The private repository contains a fresh history, not imported Git history.

Omitted upstream project administration includes workflows, funding/sponsor files, issue templates, contribution instructions, badges, community links, bots, security contacts, release/install infrastructure and root test PDFs. The application-specific Gradle modules and frontend aliases now select the free core. Original logo rasters, icon branding, marketing previews and remote documentation synchronization were removed; replacement SVG marks are local. Three invalid font downloads containing HTML were removed along with their catalog entries. Nested PDF test fixtures remain for existing tests.

Removed runtime integrations include the Java PostHog configuration/logger/service and sending aggregator, frontend analytics calls, Scarf tracking, update fetching/prompts, Google Drive picker and Telegram integration. PDF operation statistics now remain local. URL-import routes are blocked; certificate AIA fetching, remote trust-list loading and revocation checks are disabled at startup. Timestamping requires an explicitly configured server. Browser CSP permits local resources and bundled workers.

## Build and tests

| Check | Outcome |
| --- | --- |
| Production frontend build | Passed |
| TypeScript check | Passed |
| Full frontend unit suite | 339 files; 3,639 tests passed |
| Full common Java suite | 2,190 cases; 2,166 passed, 24 skipped; no failures/errors |
| Full core Java suite | 3,728 cases; 3,719 passed, 9 skipped; no failures/errors |
| Clean Java package | Passed; Java 25 |
| New library/pipeline/lock/certificate tests | Included in Java suites |
| Live workspace integration | See `workspace-verification.json` |
| Browser screenshots/network check | See `browser-verification.json` |
| Live PDF tool outputs | See `tool-verification.json` |

Platform skips cover POSIX-only process/sandbox tests, optional fixture probes and three direct calls into an unstable Windows native text-replacement engine. The public Windows redaction path uses the tested fallback instead. Removed integration tests targeted deleted telemetry, update, cloud or excluded functionality. Tests were updated for local documentation, new branding and secure redaction behavior.

Final targeted checks also passed for routing, font-library resources, workspace services, and draw/type signature components. Live browser verification opened a fictional 220-page PDF in 4,650 ms, exercised both comparison modes, created a local typed signature and toggled the library without page errors. This is a synthetic responsiveness check, not a benchmark for scanned or image-heavy documents.

Compilation no longer runs a source-mutating formatter automatically. The inherited optional Spotless/Google formatter reported a Guava classloader failure on a clean run; formatting remains a separate task. Normal compilation, packaging and tests do not require that task.

## Feature checklist

| Requested capability | Status and practical scope |
| --- | --- |
| Three-pane frame, rail, dark/light/system, local Inter, glow/accent settings | Built; responsive rail and tool drawer, collapsible desktop library |
| Recent/type/review/pinned lists, editable classification rules, tags | Built; rules use filename and extracted text, not a learned model |
| SQLite, FTS5, duplicate detection, append-only versions and restore | Built and tested |
| Watched folders | Built with stable-file polling every five seconds, rather than an OS-specific watcher |
| Virtualized library and lazy PDF pages | Built/reused; document API currently returns at most 1,000 matches |
| Viewer, thumbnails, reordering, tabs, search, annotations, forms, undo/redo | Reused existing viewer; annotations export through debounced autosave |
| All free PDF tools | Existing registry exposed, with the requested compact groups; local engine availability still applies |
| Regex redaction presets and custom patterns | Built into existing panel; email, phone and example ID presets |
| Manual and automatic redaction | Reused and hardened; live outputs checked. Windows fallback rasterizes and rebuilds safe searchable text where supported |
| Compression presets and size feedback | Reused existing tool panel; Java-only compression exercised |
| OCR and selectable languages | Existing panel retained with local preference; end-to-end verification blocked by missing Tesseract/OCRmyPDF |
| Compare text and visual diff | Existing client tools retained; separate browser verification recorded where exercised |
| Draw/type/upload signatures | Existing local signing tool retained; hosted/group signing disabled |
| PKCS#12 and self-signed generator | Built/reused; actual certificate-signed PDF generated locally |
| Timestamp | Off by default; configured-server-only dispatch; no public TSA called during verification |
| Visual pipeline builder and run history | Built; reorderable step cards with editable parameters, progress and persisted jobs |
| Pipeline scope | Rotate, compress, watermark, sanitize and metadata are allowlisted; four have builder presets. Full arbitrary-tool pipeline editing remains incomplete |
| Run document/folder/watch and export to selected folder | Built; actual two-step run and export verified |
| Notifications, command palette, toasts, empty/loading states, shortcuts | Built; palette searches tool names and document titles; library search provides full text |
| Preferences, retention, lock, About and Licenses | Built; default folder values are persisted but do not prefill every existing tool picker |
| Custom tools | Working Hello Tool and eight-step guide; source plugins require rebuilding, rather than runtime module loading |
| Demo library | Built; four fictional documents generated locally |
| Recent exports subsection | Incomplete: pipeline outputs are written, but a separate export index/list has not been added |
| Live preview for every tool | Existing preview support reused; tools without preview still apply through their existing workflow |
| Central design tokens | Workspace tokens centralized; inherited editor styles and some layout spacing remain separate |
| Keyboard shortcut customization | Help available; editable shortcut bindings remain incomplete |
| Docker execution | Recipe provided; blocked by Docker missing on this machine |

Raster redaction discards original objects, forms and vector content. On Windows, the automatic fallback restores unredacted Latin search text where possible; unsupported Unicode, rotated pages and some crop offsets can lose their searchable layer. Keep original versions and inspect results. The optional lock is access control, not disk encryption.

## Branding audit and offline evidence

Owned Java package prefixes, app text, i18n resources, storage keys, web title/manifest/favicon, OpenAPI title and generated test PDF metadata use TearPDF. Original attribution appears in LICENSE, the in-app Licenses source/assets and README Acknowledgements.

The strict name search is **not empty outside attribution**: published external Maven coordinates, their Java imports and dependency license notices retain original identifiers. Changing these requires relocating/vendoring separate libraries and their native bindings; a text rename would break compilation or JNI linkage. `name-audit.json` records the exact retained source matches. No project-owned package retains the old prefix. The exception is disclosed rather than concealed.

The browser verification logs external requests and page errors during workspace navigation. Local-only network observations establish the behavior of those tested flows; they are not a formal audit of every optional inherited parser, engine or API. Internet access is required for a first dependency/image build, and explicitly configured timestamping intentionally uses a network server. Runtime dependency downloads, telemetry and update checks are not required.

The first direct timestamp API check exposed an inherited YAML default and contacted a public TSA with a fictional test document hash. `network-regression-before.json` preserves that failed check. The default was removed, startup now clears legacy timestamp configuration, and the API additionally requires an explicit persisted workspace setting. A new regression test covers default-off behavior, saved configuration, restart and disabling. The final package and backend network checks were repeated after this fix.

Screenshots are in `docs/screenshots/`: library/viewer, tool panel, pipeline builder, settings and Licenses, in both themes at 1440×900 and 390×900. Verification JSON contains only fictional/local test data.

Bundled font notices include copyright and license metadata extracted from every font binary, the complete OFL and Apache texts, and the [BaKoMa license](https://github.com/matplotlib/matplotlib/blob/main/LICENSE/LICENSE_BAKOMA). The [CTAN package entry](https://ctan.org/pkg/bakoma-fonts) identifies the latter as a free license. These notices are bundled in the Licenses page; no runtime font download is used.
