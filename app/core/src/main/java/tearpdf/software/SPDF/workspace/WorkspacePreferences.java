package tearpdf.software.SPDF.workspace;

import java.util.*;

import org.springframework.stereotype.Service;

import tearpdf.software.common.model.ApplicationProperties;

@Service
public class WorkspacePreferences {
    private final LibraryStore store;
    private final ApplicationProperties properties;
    private static final Set<String> KEYS =
            Set.of(
                    "inputFolder",
                    "outputFolder",
                    "ocrLanguages",
                    "timestampServer",
                    "tempRetentionHours");

    public WorkspacePreferences(LibraryStore store, ApplicationProperties properties)
            throws Exception {
        this.store = store;
        this.properties = properties;
        properties.getSecurity().getTimestamp().setDefaultTsaUrl("");
        for (var row :
                store.query(
                        "SELECT * FROM settings WHERE key IN ('tempRetentionHours','timestampServer')"))
            apply(row.get("key").toString(), row.get("value").toString());
    }

    private void apply(String key, String value) {
        if (key.equals("timestampServer"))
            properties.getSecurity().getTimestamp().setDefaultTsaUrl(value);
        if (key.equals("tempRetentionHours") && !value.isBlank()) {
            long hours = Long.parseLong(value);
            if (hours < 1 || hours > 8760)
                throw new IllegalArgumentException("Retention must be between 1 and 8760 hours");
            properties.getSystem().getTempFileManagement().setMaxAgeHours(hours);
        }
    }

    public boolean timestampEnabled() {
        try {
            return store.query("SELECT value FROM settings WHERE key='timestampServer'")
                    .stream().anyMatch(row -> !row.get("value").toString().isBlank());
        } catch (Exception e) {
            return false;
        }
    }

    public void save(Map<String, String> settings) throws Exception {
        for (var e : settings.entrySet()) {
            if (!KEYS.contains(e.getKey()))
                throw new IllegalArgumentException("Unknown preference");
            if (e.getKey().equals("timestampServer") && !e.getValue().isBlank()) {
                var uri = java.net.URI.create(e.getValue());
                if (!Set.of("http", "https").contains(uri.getScheme()) || uri.getHost() == null)
                    throw new IllegalArgumentException(
                            "Enter an HTTP or HTTPS timestamp server URL");
            }
            apply(e.getKey(), e.getValue());
            store.update(
                    "INSERT INTO settings VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                    e.getKey(),
                    e.getValue());
        }
    }
}
