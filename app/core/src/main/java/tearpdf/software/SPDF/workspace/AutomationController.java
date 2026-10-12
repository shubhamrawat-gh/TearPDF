package tearpdf.software.SPDF.workspace;

import java.nio.file.*;
import java.util.*;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workspace")
public class AutomationController {
    private final LibraryStore store;
    private final WorkspaceAutomation automation;

    public AutomationController(LibraryStore store, WorkspaceAutomation automation) {
        this.store = store;
        this.automation = automation;
    }

    @GetMapping("/pipelines")
    public Object pipelines() throws Exception {
        return store.query("SELECT * FROM pipelines ORDER BY name");
    }

    @PostMapping("/pipelines")
    public Object save(@RequestBody WorkspaceAutomation.Pipeline pipeline) throws Exception {
        return Map.of("id", automation.save(pipeline));
    }

    @PostMapping("/pipelines/{id}/run")
    public Object run(@PathVariable String id, @RequestBody Map<String, String> body)
            throws Exception {
        return Map.of("job", automation.run(id, body.get("documentId"), body.get("output")));
    }

    @GetMapping("/jobs")
    public Object jobs() throws Exception {
        return store.query("SELECT * FROM jobs ORDER BY created DESC LIMIT 100");
    }

    @PostMapping("/pipelines/{id}/folder")
    public Object runFolder(@PathVariable String id, @RequestBody Map<String, String> body)
            throws Exception {
        Path folder = Path.of(body.get("path")).toAbsolutePath().normalize();
        if (!Files.isDirectory(folder))
            throw new IllegalArgumentException("Choose an existing folder");
        List<String> jobs = new ArrayList<>();
        try (var paths = Files.list(folder)) {
            for (Path file :
                    paths.filter(Files::isRegularFile)
                            .filter(p -> p.toString().toLowerCase(Locale.ROOT).endsWith(".pdf"))
                            .toList()) {
                if (Files.size(file) > 256L * 1024 * 1024) continue;
                var document =
                        store.importPdf(
                                file.getFileName().toString(),
                                Files.readAllBytes(file),
                                null,
                                "Folder run");
                jobs.add(automation.run(id, document.get("id").toString(), body.get("output")));
            }
        }
        return Map.of("jobs", jobs);
    }

    @GetMapping("/watched")
    public Object watched() throws Exception {
        return store.query("SELECT * FROM watched ORDER BY path");
    }

    @PostMapping("/watched")
    public Object watch(@RequestBody Map<String, String> body) throws Exception {
        Path path = Path.of(body.get("path")).toAbsolutePath().normalize();
        if (!Files.isDirectory(path))
            throw new IllegalArgumentException("Choose an existing local folder");
        String output = body.get("output");
        if (output != null && !output.isBlank()
                && Path.of(output).toAbsolutePath().normalize().equals(path))
            throw new IllegalArgumentException("Choose an output folder different from the watched folder");
        store.update(
                "INSERT INTO watched VALUES(?,?,?,?)",
                UUID.randomUUID().toString(),
                path.toString(),
                body.get("pipelineId"),
                body.get("output"));
        return watched();
    }

    @DeleteMapping("/watched/{id}")
    public void unwatch(@PathVariable String id) throws Exception {
        store.update("DELETE FROM watched WHERE id=?", id);
    }

    @GetMapping("/hello")
    public Object hello() {
        return Map.of("message", "Hello from TearPDF. This tool runs locally.");
    }
}
