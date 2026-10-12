package tearpdf.software.SPDF.workspace;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.file.*;
import java.util.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LibraryStoreTest {
    @TempDir Path directory;

    @Test
    void importDeduplicatesAndSearchesText() throws Exception {
        try (var store = new LibraryStore(directory.toString())) {
            var docs = store.demo();
            assertEquals(4, docs.size());
            var first = docs.getFirst();
            String id = first.get("id").toString();
            var duplicate =
                    store.importPdf(
                            "Another name.pdf",
                            Files.readAllBytes(store.file(id, null)),
                            null,
                            "Duplicate");
            assertEquals(id, duplicate.get("id"));
            assertEquals(4, store.documents("").size());
            assertEquals(4, store.documents("fictional").size());
            assertEquals(1, store.documents("Northstar").size());
            assertTrue(store.documents("missing phrase").isEmpty());
            assertDoesNotThrow(() -> store.documents("\" OR *"));
        }
    }

    @Test
    void protectedVersionsPersistWithoutExposingOldSearchText() throws Exception {
        try (var store = new LibraryStore(directory.toString())) {
            String id = store.demo().getFirst().get("id").toString();
            byte[] encrypted;
            try (var pdf =
                    org.apache.pdfbox.Loader.loadPDF(Files.readAllBytes(store.file(id, null)))) {
                var policy =
                        new org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy(
                                "fictional-owner",
                                "fictional-reader",
                                new org.apache.pdfbox.pdmodel.encryption.AccessPermission());
                policy.setEncryptionKeyLength(256);
                pdf.protect(policy);
                var output = new java.io.ByteArrayOutputStream();
                pdf.save(output);
                encrypted = output.toByteArray();
            }
            store.importPdf("Protected.pdf", encrypted, id, "Password protected");
            assertEquals(2, ((Number) store.document(id).get("current_version")).intValue());
            assertArrayEquals(encrypted, Files.readAllBytes(store.file(id, null)));
            assertEquals(3, store.documents("Prepared for demonstration").size());
            store.restore(id, 1);
            assertEquals(4, store.documents("Prepared for demonstration").size());
        }
    }

    @Test
    void classificationUsesEditableRulesAndFlagsUnknown() throws Exception {
        try (var store = new LibraryStore(directory.toString())) {
            assertEquals(
                    "Invoices", store.classify("Invoice.pdf", "payment amount due").get("type"));
            assertEquals("Other", store.classify("Untitled.pdf", "").get("type"));
            assertEquals(0.0, store.classify("Untitled.pdf", "").get("confidence"));
            store.update("UPDATE types SET keywords=? WHERE name=?", "special word", "Policies");
            assertEquals("Policies", store.classify("special word.pdf", "").get("type"));
        }
    }

    @Test
    void versionsRestoreWithoutDestroyingHistoryAndPersistAcrossRestart() throws Exception {
        String id;
        try (var store = new LibraryStore(directory.toString())) {
            var docs = store.demo();
            id = docs.getFirst().get("id").toString();
            byte[] original = Files.readAllBytes(store.file(id, null));
            byte[] replacement =
                    Files.readAllBytes(store.file(docs.get(1).get("id").toString(), null));
            store.importPdf("Updated", replacement, id, "Edited");
            assertEquals(2, ((Number) store.document(id).get("current_version")).intValue());
            store.restore(id, 1);
            assertArrayEquals(original, Files.readAllBytes(store.file(id, null)));
            assertEquals(3, store.query("SELECT * FROM versions WHERE document_id=?", id).size());
            assertThrows(NoSuchElementException.class, () -> store.restore(id, 99));
            assertThrows(
                    Exception.class,
                    () -> store.importPdf("Broken.pdf", new byte[] {1, 2, 3}, null, "Bad"));
            assertEquals(4, store.documents("").size());
        }
        try (var store = new LibraryStore(directory.toString())) {
            assertEquals(3, ((Number) store.document(id).get("current_version")).intValue());
        }
    }
}
