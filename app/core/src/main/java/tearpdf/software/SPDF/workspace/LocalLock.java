package tearpdf.software.SPDF.workspace;

import java.security.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.stereotype.Service;

/** Optional local app lock. Only a salted PBKDF2 verifier is persisted. */
@Service
public class LocalLock {
    private final LibraryStore store;
    private final Map<String, Instant> sessions = new ConcurrentHashMap<>();
    private volatile String verifier = "";

    public LocalLock(LibraryStore store) throws Exception {
        this.store = store;
        var rows = store.query("SELECT value FROM settings WHERE key='lockVerifier'");
        if (!rows.isEmpty()) verifier = rows.getFirst().get("value").toString();
    }

    public boolean configured() {
        return !verifier.isEmpty();
    }

    public boolean valid(String token) {
        Instant expiry = token == null ? null : sessions.get(token);
        if (expiry != null && expiry.isAfter(Instant.now())) return true;
        if (token != null) sessions.remove(token);
        return !configured();
    }

    private static byte[] derive(String passcode, byte[] salt) throws Exception {
        var spec = new PBEKeySpec(passcode.toCharArray(), salt, 210000, 256);
        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(spec)
                    .getEncoded();
        } finally {
            spec.clearPassword();
        }
    }

    public synchronized void configure(String passcode) throws Exception {
        if (passcode.length() > 0 && passcode.length() < 6)
            throw new IllegalArgumentException("Use at least six characters");
        String next = "";
        if (!passcode.isEmpty()) {
            byte[] salt = new byte[16];
            new SecureRandom().nextBytes(salt);
            next =
                    Base64.getEncoder().encodeToString(salt)
                            + ":"
                            + Base64.getEncoder().encodeToString(derive(passcode, salt));
        }
        store.update(
                "INSERT INTO settings VALUES('lockVerifier',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                next);
        verifier = next;
        sessions.clear();
    }

    public synchronized String unlock(String passcode) throws Exception {
        if (configured()) {
            String[] parts = verifier.split(":");
            if (!MessageDigest.isEqual(
                    derive(passcode, Base64.getDecoder().decode(parts[0])),
                    Base64.getDecoder().decode(parts[1])))
                throw new IllegalArgumentException("Incorrect passcode");
        }
        String token = UUID.randomUUID().toString() + UUID.randomUUID();
        sessions.put(token, Instant.now().plus(Duration.ofHours(12)));
        return token;
    }

    public void logout(String token) {
        if (token != null) sessions.remove(token);
    }
}
