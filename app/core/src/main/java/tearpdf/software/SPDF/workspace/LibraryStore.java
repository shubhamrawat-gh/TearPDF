package tearpdf.software.SPDF.workspace;

import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.sql.*;
import java.time.Instant;
import java.util.*;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PreDestroy;

/** Owns the local document index and immutable, content-addressed PDF versions. */
@Service
public class LibraryStore implements AutoCloseable {
    private final Path root;
    private final Connection db;

    public LibraryStore(@Value("${tearpdf.library.path:./data/library}") String directory)
            throws Exception {
        root = Path.of(directory).toAbsolutePath().normalize();
        Files.createDirectories(root.resolve("objects"));
        db = DriverManager.getConnection("jdbc:sqlite:" + root.resolve("library.sqlite"));
        try (Statement s = db.createStatement()) {
            s.execute("PRAGMA journal_mode=WAL");
            s.execute("PRAGMA foreign_keys=ON");
            s.execute("PRAGMA busy_timeout=5000");
            s.execute(
                    "CREATE TABLE IF NOT EXISTS types(name TEXT PRIMARY KEY,color TEXT NOT NULL,keywords TEXT NOT NULL)");
            s.execute(
                    "CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY,title TEXT NOT NULL,type TEXT NOT NULL,confidence REAL NOT NULL,pinned INTEGER NOT NULL DEFAULT 0,tags TEXT NOT NULL DEFAULT '',created TEXT NOT NULL,opened TEXT NOT NULL,current_version INTEGER NOT NULL)");
            s.execute(
                    "CREATE TABLE IF NOT EXISTS versions(document_id TEXT NOT NULL REFERENCES documents(id),number INTEGER NOT NULL,hash TEXT NOT NULL,bytes INTEGER NOT NULL,pages INTEGER NOT NULL,created TEXT NOT NULL,label TEXT NOT NULL,PRIMARY KEY(document_id,number))");
            s.execute("CREATE INDEX IF NOT EXISTS versions_hash ON versions(hash)");
            s.execute(
                    "CREATE VIRTUAL TABLE IF NOT EXISTS document_text USING fts5(document_id UNINDEXED,title,text)");
            s.execute(
                    "CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL)");
            s.execute(
                    "CREATE TABLE IF NOT EXISTS pipelines(id TEXT PRIMARY KEY,name TEXT NOT NULL,steps TEXT NOT NULL)");
            s.execute(
                    "CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,pipeline_id TEXT,document_id TEXT,status TEXT NOT NULL,progress INTEGER NOT NULL,created TEXT NOT NULL,error TEXT)");
            s.execute(
                    "CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,message TEXT NOT NULL,created TEXT NOT NULL,unread INTEGER NOT NULL DEFAULT 1)");
            s.execute(
                    "CREATE TABLE IF NOT EXISTS watched(id TEXT PRIMARY KEY,path TEXT NOT NULL UNIQUE,pipeline_id TEXT,output TEXT)");
        }
        String[][] defaults = {
            {"Contracts", "#8b7cf8", "contract,agreement,parties,clause"},
            {"Invoices", "#33c9a0", "invoice,payment,amount due,bill"},
            {"Records", "#ebae53", "record,personnel,employee"},
            {"Purchase Orders", "#6495ef", "purchase order,quantity,supplier"},
            {"Reports", "#42b5d4", "report,findings,analysis"},
            {"Proposals", "#b27bdf", "proposal,estimate,scope"},
            {"Certificates", "#52c68a", "certificate,certified,completion"},
            {"Policies", "#7699ed", "policy,procedure,guideline"},
            {"Tax Forms", "#9da4b5", "tax,return,fiscal"},
            {"Audit Reports", "#e79260", "audit,compliance,controls"},
            {"Other", "#8a8c9e", ""}
        };
        for (String[] type : defaults)
            update("INSERT OR IGNORE INTO types VALUES(?,?,?)", (Object[]) type);
    }

    public synchronized List<Map<String, Object>> query(String sql, Object... args)
            throws SQLException {
        try (PreparedStatement p = db.prepareStatement(sql)) {
            bind(p, args);
            try (ResultSet r = p.executeQuery()) {
                List<Map<String, Object>> rows = new ArrayList<>();
                int columns = r.getMetaData().getColumnCount();
                while (r.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= columns; i++)
                        row.put(r.getMetaData().getColumnLabel(i), r.getObject(i));
                    rows.add(row);
                }
                return rows;
            }
        }
    }

    public synchronized int update(String sql, Object... args) throws SQLException {
        try (PreparedStatement p = db.prepareStatement(sql)) {
            bind(p, args);
            return p.executeUpdate();
        }
    }

    private static void bind(PreparedStatement p, Object[] args) throws SQLException {
        for (int i = 0; i < args.length; i++) p.setObject(i + 1, args[i]);
    }

    public synchronized Map<String, Object> document(String id) throws SQLException {
        var rows =
                query(
                        "SELECT d.*,v.hash,v.bytes,v.pages FROM documents d JOIN versions v ON v.document_id=d.id AND v.number=d.current_version WHERE d.id=?",
                        id);
        if (rows.isEmpty()) throw new NoSuchElementException("Document not found");
        return rows.getFirst();
    }

    public synchronized List<Map<String, Object>> documents(String search) throws SQLException {
        String select =
                "SELECT d.*,v.bytes,v.pages FROM documents d JOIN versions v ON v.document_id=d.id AND v.number=d.current_version ";
        if (search == null || search.isBlank())
            return query(select + "ORDER BY d.pinned DESC,d.opened DESC LIMIT 1000");
        String literal = '"' + search.replace("\"", "\"\"") + '"';
        return query(
                select
                        + "WHERE d.id IN (SELECT document_id FROM document_text WHERE document_text MATCH ?) OR d.tags LIKE ? ORDER BY d.pinned DESC,d.opened DESC LIMIT 1000",
                literal,
                "%" + search + "%");
    }

    public synchronized Map<String, Object> classify(String title, String text)
            throws SQLException {
        String haystack = (title + " " + text).toLowerCase(Locale.ROOT);
        String best = "Other";
        int score = 0;
        for (var type : query("SELECT * FROM types ORDER BY name")) {
            int matches = 0;
            for (String keyword : type.get("keywords").toString().split(",")) {
                if (!keyword.isBlank()
                        && haystack.contains(keyword.trim().toLowerCase(Locale.ROOT)))
                    matches +=
                            title.toLowerCase(Locale.ROOT)
                                            .contains(keyword.trim().toLowerCase(Locale.ROOT))
                                    ? 3
                                    : 1;
            }
            if (matches > score) {
                score = matches;
                best = type.get("name").toString();
            }
        }
        return Map.of("type", best, "confidence", Math.min(0.99, score * 0.3));
    }

    public synchronized Map<String, Object> importPdf(
            String title, byte[] bytes, String existingId, String label) throws Exception {
        if (bytes.length > 256 * 1024 * 1024)
            throw new IllegalArgumentException("PDF exceeds 256 MB import limit");
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        if (existingId == null) {
            var duplicates = query("SELECT document_id FROM versions WHERE hash=? LIMIT 1", hash);
            if (!duplicates.isEmpty())
                return document(duplicates.getFirst().get("document_id").toString());
        }
        if (existingId != null
                && hash.equals(document(existingId).get("hash"))
                && !label.startsWith("Restored")) return document(existingId);
        int pages;
        String text;
        try (PDDocument pdf = Loader.loadPDF(bytes)) {
            pages = pdf.getNumberOfPages();
            text = new PDFTextStripper().getText(pdf);
        } catch (org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException protectedPdf) {
            pages =
                    existingId == null
                            ? 0
                            : ((Number) document(existingId).get("pages")).intValue();
            text = "";
        }
        String id = existingId == null ? UUID.randomUUID().toString() : existingId;
        int version =
                existingId == null
                        ? 1
                        : ((Number)
                                        query(
                                                        "SELECT COALESCE(MAX(number),0)+1 AS n FROM versions WHERE document_id=?",
                                                        id)
                                                .getFirst()
                                                .get("n"))
                                .intValue();
        if (existingId != null) document(id);
        Path target = root.resolve("objects").resolve(hash + ".pdf");
        if (!Files.exists(target)) {
            Path temp = Files.createTempFile(root.resolve("objects"), "import-", ".tmp");
            try {
                Files.write(temp, bytes);
                Files.move(temp, target, StandardCopyOption.REPLACE_EXISTING);
            } finally {
                Files.deleteIfExists(temp);
            }
        }
        String now = Instant.now().toString();
        var classification = classify(title, text);
        db.setAutoCommit(false);
        try {
            if (existingId == null)
                update(
                        "INSERT INTO documents(id,title,type,confidence,created,opened,current_version) VALUES(?,?,?,?,?,?,?)",
                        id,
                        title,
                        classification.get("type"),
                        classification.get("confidence"),
                        now,
                        now,
                        version);
            else
                update(
                        "UPDATE documents SET current_version=?,opened=? WHERE id=?",
                        version,
                        now,
                        id);
            update(
                    "INSERT INTO versions VALUES(?,?,?,?,?,?,?)",
                    id,
                    version,
                    hash,
                    bytes.length,
                    pages,
                    now,
                    label);
            update("DELETE FROM document_text WHERE document_id=?", id);
            update("INSERT INTO document_text VALUES(?,?,?)", id, title, text);
            db.commit();
        } catch (Exception e) {
            db.rollback();
            throw e;
        } finally {
            db.setAutoCommit(true);
        }
        notify("Saved " + title + " · version " + version);
        return document(id);
    }

    public synchronized Path file(String id, Integer version) throws SQLException {
        if (version == null)
            return root.resolve("objects").resolve(document(id).get("hash") + ".pdf");
        var rows = query("SELECT hash FROM versions WHERE document_id=? AND number=?", id, version);
        if (rows.isEmpty()) throw new NoSuchElementException("Version not found");
        return root.resolve("objects").resolve(rows.getFirst().get("hash") + ".pdf");
    }

    public synchronized Map<String, Object> restore(String id, int version) throws Exception {
        return importPdf(
                document(id).get("title").toString(),
                Files.readAllBytes(file(id, version)),
                id,
                "Restored version " + version);
    }

    public synchronized void notify(String message) throws SQLException {
        update(
                "INSERT INTO notifications VALUES(?,?,?,1)",
                UUID.randomUUID().toString(),
                message,
                Instant.now().toString());
    }

    public synchronized List<Map<String, Object>> demo() throws Exception {
        List<Map<String, Object>> docs = new ArrayList<>();
        for (String title :
                List.of(
                        "Northstar Studio - Services Agreement",
                        "Juniper Works - Invoice 1042",
                        "Willow Research - Quarterly Report",
                        "Cedar Supply - Purchase Order")) {
            try (PDDocument pdf = new PDDocument()) {
                PDPage page = new PDPage();
                pdf.addPage(page);
                pdf.getDocumentInformation().setProducer("TearPDF");
                pdf.getDocumentInformation().setCreator("TearPDF");
                pdf.getDocumentInformation().setTitle(title);
                try (PDPageContentStream stream = new PDPageContentStream(pdf, page)) {
                    stream.beginText();
                    stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 20);
                    stream.newLineAtOffset(56, 730);
                    stream.showText("TearPDF / Demo Library");
                    stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                    stream.newLineAtOffset(0, -48);
                    stream.showText(title);
                    for (String line :
                            List.of(
                                    "Fictional sample document generated on your machine.",
                                    "Prepared for demonstration only. Reference TP-2026-001.",
                                    "All names and figures are invented. No real personal information.",
                                    "Your PDFs. Your machine.")) {
                        stream.newLineAtOffset(0, -32);
                        stream.showText(line);
                    }
                    stream.endText();
                }
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                pdf.save(output);
                docs.add(importPdf(title + ".pdf", output.toByteArray(), null, "Demo import"));
            }
        }
        return docs;
    }

    @PreDestroy
    public synchronized void close() throws SQLException {
        db.close();
    }
}
