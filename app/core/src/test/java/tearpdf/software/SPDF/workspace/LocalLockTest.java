package tearpdf.software.SPDF.workspace;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LocalLockTest {
    @TempDir Path directory;

    @Test
    void persistsVerifierAndExpiresAccessOnLock() throws Exception {
        try (var store = new LibraryStore(directory.toString())) {
            var lock = new LocalLock(store);
            assertTrue(lock.valid(null));
            lock.configure("private-passcode");
            assertFalse(lock.valid(null));
            assertThrows(IllegalArgumentException.class, () -> lock.unlock("wrong"));
            String session = lock.unlock("private-passcode");
            assertTrue(lock.valid(session));
            lock.logout(session);
            assertFalse(lock.valid(session));
            assertFalse(
                    store.query("SELECT value FROM settings WHERE key='lockVerifier'")
                            .getFirst()
                            .get("value")
                            .toString()
                            .contains("private-passcode"));
            assertFalse(new LocalLock(store).valid(null));
            lock.configure("");
            assertTrue(lock.valid(null));
        }
    }
}
