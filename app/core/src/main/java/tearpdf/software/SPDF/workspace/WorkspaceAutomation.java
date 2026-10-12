package tearpdf.software.SPDF.workspace;

import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

import org.springframework.core.io.FileSystemResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PreDestroy;

import tearpdf.software.common.service.InternalApiClient;

import tools.jackson.databind.ObjectMapper;

/** Dispatches persisted pipelines through the existing local PDF tool API. */
@Service
public class WorkspaceAutomation {
    public record Step(String endpoint, Map<String, String> parameters) {}

    public record Pipeline(String name, List<Step> steps) {}

    private static final Set<String> ALLOWED =
            Set.of(
                    "/api/v1/general/rotate-pdf",
                    "/api/v1/misc/compress-pdf",
                    "/api/v1/security/add-watermark",
                    "/api/v1/security/sanitize-pdf",
                    "/api/v1/misc/update-metadata");
    private final LibraryStore store;
    private final InternalApiClient api;
    private final ObjectMapper mapper;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final Set<String> pending = ConcurrentHashMap.newKeySet();
    private final Map<String, String> settled = new ConcurrentHashMap<>();

    public WorkspaceAutomation(LibraryStore store, InternalApiClient api, ObjectMapper mapper)
            throws Exception {
        this.store = store;
        this.api = api;
        this.mapper = mapper;
        store.update(
                "CREATE TABLE IF NOT EXISTS watched_seen(path TEXT PRIMARY KEY,signature TEXT NOT NULL)");
        store.update(
                "UPDATE jobs SET status='interrupted',error='Application stopped before completion' WHERE status IN ('queued','running')");
    }

    public String save(Pipeline pipeline) throws Exception {
        if (pipeline.name() == null
                || pipeline.name().isBlank()
                || pipeline.steps() == null
                || pipeline.steps().isEmpty())
            throw new IllegalArgumentException("Name and at least one step are required");
        for (Step step : pipeline.steps())
            if (!ALLOWED.contains(step.endpoint()))
                throw new IllegalArgumentException("Unsupported offline pipeline endpoint");
        String id = UUID.randomUUID().toString();
        store.update(
                "INSERT INTO pipelines VALUES(?,?,?)",
                id,
                pipeline.name(),
                mapper.writeValueAsString(pipeline.steps()));
        return id;
    }

    public String run(String pipelineId, String documentId, String output) throws Exception {
        var rows = store.query("SELECT * FROM pipelines WHERE id=?", pipelineId);
        if (rows.isEmpty()) throw new IllegalArgumentException("Pipeline not found");
        store.document(documentId);
        Step[] steps = mapper.readValue(rows.getFirst().get("steps").toString(), Step[].class);
        String job = UUID.randomUUID().toString();
        store.update(
                "INSERT INTO jobs VALUES(?,?,?,'queued',0,?,NULL)",
                job,
                pipelineId,
                documentId,
                Instant.now().toString());
        worker.submit(
                () -> {
                    try {
                        store.update("UPDATE jobs SET status='running' WHERE id=?", job);
                        for (int i = 0; i < steps.length; i++) {
                            Step step = steps[i];
                            if (!ALLOWED.contains(step.endpoint()))
                                throw new IllegalArgumentException(
                                        "Pipeline contains a disabled endpoint");
                            var body = new LinkedMultiValueMap<String, Object>();
                            body.add(
                                    "fileInput",
                                    new FileSystemResource(store.file(documentId, null)));
                            if (step.parameters() != null) step.parameters().forEach(body::add);
                            var response = api.post(step.endpoint(), body);
                            if (response.getBody() == null)
                                throw new IllegalStateException("Tool returned no PDF");
                            try (var stream = response.getBody().getInputStream()) {
                                byte[] bytes = stream.readNBytes(256 * 1024 * 1024 + 1);
                                store.importPdf(
                                        store.document(documentId).get("title").toString(),
                                        bytes,
                                        documentId,
                                        "Pipeline: "
                                                + rows.getFirst().get("name")
                                                + " / step "
                                                + (i + 1));
                            }
                            store.update(
                                    "UPDATE jobs SET progress=? WHERE id=?",
                                    (i + 1) * 100 / steps.length,
                                    job);
                        }
                        if (output != null && !output.isBlank()) {
                            Path folder = Path.of(output).toAbsolutePath().normalize();
                            Files.createDirectories(folder);
                            Files.copy(
                                    store.file(documentId, null),
                                    folder.resolve("TearPDF-" + job + ".pdf"));
                        }
                        store.update(
                                "UPDATE jobs SET status='finished',progress=100 WHERE id=?", job);
                        store.notify("Pipeline finished: " + rows.getFirst().get("name"));
                    } catch (Exception e) {
                        try {
                            store.update(
                                    "UPDATE jobs SET status='failed',error=? WHERE id=?",
                                    e.getMessage(),
                                    job);
                            store.notify("Pipeline failed: " + e.getMessage());
                        } catch (Exception ignored) {
                        }
                    }
                });
        return job;
    }

    @Scheduled(fixedDelay = 5000)
    public void scan() {
        try {
            for (var folder : store.query("SELECT * FROM watched")) {
                Path directory = Path.of(folder.get("path").toString());
                if (!Files.isDirectory(directory)) continue;
                try (var files = Files.list(directory)) {
                    for (Path file :
                            files.filter(
                                            p ->
                                                    p.getFileName()
                                                            .toString()
                                                            .toLowerCase(Locale.ROOT)
                                                            .endsWith(".pdf"))
                                    .toList()) {
                        if (!Files.isRegularFile(file) || Files.size(file) > 256 * 1024 * 1024)
                            continue;
                        String key = file.toAbsolutePath().toString();
                        String signature =
                                Files.size(file) + ":" + Files.getLastModifiedTime(file).toMillis();
                        if (!signature.equals(settled.put(key, signature))) continue;
                        var seen =
                                store.query("SELECT signature FROM watched_seen WHERE path=?", key);
                        if (!seen.isEmpty() && seen.getFirst().get("signature").equals(signature))
                            continue;
                        if (!pending.add(key)) continue;
                        worker.submit(
                                () -> {
                                    try {
                                        var doc =
                                                store.importPdf(
                                                        file.getFileName().toString(),
                                                        Files.readAllBytes(file),
                                                        null,
                                                        "Watched folder");
                                        store.update(
                                                "INSERT INTO watched_seen VALUES(?,?) ON CONFLICT(path) DO UPDATE SET signature=excluded.signature",
                                                key,
                                                signature);
                                        if (folder.get("pipeline_id") != null
                                                && !folder.get("pipeline_id").toString().isBlank())
                                            run(
                                                    folder.get("pipeline_id").toString(),
                                                    doc.get("id").toString(),
                                                    (String) folder.get("output"));
                                    } catch (Exception e) {
                                        try {
                                            store.notify(
                                                    "Watched import failed: " + e.getMessage());
                                        } catch (Exception ignored) {
                                        }
                                    } finally {
                                        pending.remove(key);
                                    }
                                });
                    }
                }
            }
        } catch (Exception e) {
            System.getLogger(getClass().getName())
                    .log(System.Logger.Level.WARNING, "Folder scan failed", e);
        }
    }

    @PreDestroy
    public void close() {
        worker.shutdownNow();
    }
}
