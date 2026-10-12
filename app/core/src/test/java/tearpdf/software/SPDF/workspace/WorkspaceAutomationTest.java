package tearpdf.software.SPDF.workspace;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.nio.file.*;
import java.util.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import tearpdf.software.common.service.InternalApiClient;

import tools.jackson.databind.ObjectMapper;

class WorkspaceAutomationTest {
    @TempDir Path directory;

    @Test
    void runsToolsAndPersistsVersionAndHistory() throws Exception {
        try (var store = new LibraryStore(directory.toString())) {
            var docs = store.demo();
            String id = docs.getFirst().get("id").toString();
            byte[] output = Files.readAllBytes(store.file(docs.get(1).get("id").toString(), null));
            InternalApiClient client = mock(InternalApiClient.class);
            when(client.post(anyString(), any()))
                    .thenReturn(ResponseEntity.ok((Resource) new ByteArrayResource(output)));
            var automation = new WorkspaceAutomation(store, client, new ObjectMapper());
            try {
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                automation.save(
                                        new WorkspaceAutomation.Pipeline(
                                                "Remote",
                                                List.of(
                                                        new WorkspaceAutomation.Step(
                                                                "https://example.com",
                                                                Map.of())))));
                String pipeline =
                        automation.save(
                                new WorkspaceAutomation.Pipeline(
                                        "Rotate",
                                        List.of(
                                                new WorkspaceAutomation.Step(
                                                        "/api/v1/general/rotate-pdf",
                                                        Map.of("angle", "90")))));
                String job = automation.run(pipeline, id, null);
                String status = "";
                long end = System.nanoTime() + java.util.concurrent.TimeUnit.SECONDS.toNanos(10);
                while (System.nanoTime() < end) {
                    status =
                            store.query("SELECT status FROM jobs WHERE id=?", job)
                                    .getFirst()
                                    .get("status")
                                    .toString();
                    if (status.equals("finished") || status.equals("failed")) break;
                    Thread.sleep(30);
                }
                assertEquals("finished", status);
                assertEquals(2, ((Number) store.document(id).get("current_version")).intValue());
                assertArrayEquals(output, Files.readAllBytes(store.file(id, null)));
                verify(client).post(eq("/api/v1/general/rotate-pdf"), any());
            } finally {
                automation.close();
            }
        }
    }
}
