package tearpdf.software.SPDF.workspace;

import java.nio.file.Files;
import java.util.*;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/workspace")
public class WorkspaceController {
    private final LibraryStore store;
    private final WorkspacePreferences preferences;

    public WorkspaceController(LibraryStore store, WorkspacePreferences preferences) {
        this.store = store;
        this.preferences = preferences;
    }

    @GetMapping("/documents")
    public Object documents(@RequestParam(defaultValue = "") String q) throws Exception {
        return store.documents(q);
    }

    @PostMapping("/documents")
    public Object upload(@RequestParam MultipartFile file) throws Exception {
        return store.importPdf(
                Optional.ofNullable(file.getOriginalFilename()).orElse("Document.pdf"),
                file.getBytes(),
                null,
                "Imported");
    }

    @GetMapping("/documents/{id}/file")
    public ResponseEntity<FileSystemResource> file(
            @PathVariable String id, @RequestParam(required = false) Integer version)
            throws Exception {
        store.update(
                "UPDATE documents SET opened=? WHERE id=?", java.time.Instant.now().toString(), id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(new FileSystemResource(store.file(id, version)));
    }

    @PostMapping("/documents/{id}/versions")
    public Object version(
            @PathVariable String id,
            @RequestParam MultipartFile file,
            @RequestParam(defaultValue = "Edited") String label)
            throws Exception {
        return store.importPdf(
                store.document(id).get("title").toString(), file.getBytes(), id, label);
    }

    @GetMapping("/documents/{id}/versions")
    public Object versions(@PathVariable String id) throws Exception {
        return store.query("SELECT * FROM versions WHERE document_id=? ORDER BY number DESC", id);
    }

    @PostMapping("/documents/{id}/restore/{version}")
    public Object restore(@PathVariable String id, @PathVariable int version) throws Exception {
        return store.restore(id, version);
    }

    @PatchMapping("/documents/{id}")
    public Object edit(@PathVariable String id, @RequestBody Map<String, Object> changes)
            throws Exception {
        store.document(id);
        for (String field : List.of("title", "type", "tags", "pinned"))
            if (changes.containsKey(field))
                store.update(
                        "UPDATE documents SET " + field + "=? WHERE id=?", changes.get(field), id);
        if (changes.containsKey("type"))
            store.update("UPDATE documents SET confidence=1 WHERE id=?", id);
        if (changes.containsKey("title"))
            store.update(
                    "UPDATE document_text SET title=? WHERE document_id=?",
                    changes.get("title"),
                    id);
        return store.document(id);
    }

    @GetMapping("/types")
    public Object types() throws Exception {
        return store.query(
                "SELECT t.*,COUNT(d.id) AS count,SUM(CASE WHEN d.confidence<0.6 THEN 1 ELSE 0 END) AS review FROM types t LEFT JOIN documents d ON d.type=t.name GROUP BY t.name ORDER BY t.rowid");
    }

    @PutMapping("/types/{name}")
    public Object type(@PathVariable String name, @RequestBody Map<String, String> body)
            throws Exception {
        store.update(
                "UPDATE types SET name=?,color=?,keywords=? WHERE name=?",
                body.getOrDefault("name", name),
                body.getOrDefault("color", "#8b7cf8"),
                body.getOrDefault("keywords", ""),
                name);
        store.update(
                "UPDATE documents SET type=? WHERE type=?", body.getOrDefault("name", name), name);
        return types();
    }

    @PostMapping("/demo")
    public Object demo() throws Exception {
        return store.demo();
    }

    @GetMapping("/notifications")
    public Object notifications() throws Exception {
        return store.query("SELECT * FROM notifications ORDER BY created DESC LIMIT 100");
    }

    @PostMapping("/notifications/read")
    public void readNotifications() throws Exception {
        store.update("UPDATE notifications SET unread=0");
    }

    @GetMapping("/settings")
    public Object settings() throws Exception {
        return store.query("SELECT * FROM settings WHERE key <> 'lockVerifier'");
    }

    @PutMapping("/settings")
    public void settings(@RequestBody Map<String, String> settings) throws Exception {
        preferences.save(settings);
    }

    @GetMapping("/stats")
    public Object stats() throws Exception {
        return Map.of(
                "pipelines",
                store.query("SELECT COUNT(*) AS n FROM pipelines").getFirst().get("n"),
                "today",
                store.query(
                                "SELECT COUNT(*) AS n FROM jobs WHERE status='finished' AND substr(created,1,10)=date('now')")
                        .getFirst()
                        .get("n"));
    }

    @GetMapping("/licenses")
    public String licenses() throws Exception {
        return Files.readString(java.nio.file.Path.of("LICENSE"));
    }

    @GetMapping("/usage")
    public Object usage() throws Exception {
        store.update(
                "CREATE TABLE IF NOT EXISTS tool_usage(tool TEXT PRIMARY KEY,count INTEGER NOT NULL)");
        return store.query("SELECT * FROM tool_usage ORDER BY count DESC");
    }

    @PostMapping("/usage/{tool}")
    public void trackLocalUse(@PathVariable String tool) throws Exception {
        store.update(
                "CREATE TABLE IF NOT EXISTS tool_usage(tool TEXT PRIMARY KEY,count INTEGER NOT NULL)");
        store.update(
                "INSERT INTO tool_usage VALUES(?,1) ON CONFLICT(tool) DO UPDATE SET count=count+1",
                tool);
    }

    @ExceptionHandler({IllegalArgumentException.class, NoSuchElementException.class})
    public ResponseEntity<Map<String, String>> invalid(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
