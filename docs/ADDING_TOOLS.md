# Add a local tool

The example in `plugins/hello` is compiled into the application. Tools are trusted local source additions, not runtime downloads.

1. Create a directory under `plugins/` with a README describing inputs and outputs.
2. Add a Spring `@RestController` under `app/core/src/main/java/tearpdf/software/SPDF/workspace/`. The Hello Tool endpoint is in `AutomationController.java`.
3. Use an `/api/v1/workspace/` route. For PDF transformations accept a multipart `file` and return `application/pdf`; close document and stream resources.
4. Add an options component under `frontend/editor/src/core/workspace/`. Keep requests relative to the local origin and use `api.ts` for JSON or multipart requests.
5. Add a Custom tools button in `Workspace.tsx`. The working Hello Tool button calls `/hello` and displays its returned message in a toast. Render your options component when the tool is selected.
6. For transformed PDFs call the workspace's `saveResults` callback with a `File`. It saves a new library version. Preview bytes through the existing tool-workflow preview API before applying.
7. If the operation is safe for background jobs, add its endpoint to `WorkspaceAutomation.ALLOWED` and a step preset to the pipeline builder. Keep the input field named `fileInput` for existing tool endpoints.
8. Add a meaningful backend test, run `npm run typecheck`, `npm run build` in `frontend`, then `./gradlew :common:test :tearpdf:test :tearpdf:bootJar` at the project root. Restart the local app and check the tool.
