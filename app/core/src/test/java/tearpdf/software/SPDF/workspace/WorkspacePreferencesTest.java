package tearpdf.software.SPDF.workspace;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import tearpdf.software.common.model.ApplicationProperties;

class WorkspacePreferencesTest {
    @TempDir Path directory;

    @Test
    void timestampRequiresExplicitPersistedWorkspacePreference() throws Exception {
        try (var store = new LibraryStore(directory.toString())) {
            var properties = new ApplicationProperties();
            properties.getSecurity().getTimestamp().setDefaultTsaUrl("https://legacy.example.invalid");
            var preferences = new WorkspacePreferences(store, properties);
            assertEquals("", properties.getSecurity().getTimestamp().getDefaultTsaUrl());
            assertFalse(preferences.timestampEnabled());
            preferences.save(Map.of("timestampServer", "http://127.0.0.1:9999"));
            assertTrue(preferences.timestampEnabled());
            var restarted = new ApplicationProperties();
            var restored = new WorkspacePreferences(store, restarted);
            assertEquals("http://127.0.0.1:9999", restarted.getSecurity().getTimestamp().getDefaultTsaUrl());
            restored.save(Map.of("timestampServer", ""));
            assertFalse(restored.timestampEnabled());
            assertEquals("", restarted.getSecurity().getTimestamp().getDefaultTsaUrl());
        }
    }
}
