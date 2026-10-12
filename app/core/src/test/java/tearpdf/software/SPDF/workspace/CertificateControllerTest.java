package tearpdf.software.SPDF.workspace;

import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayInputStream;
import java.security.KeyStore;
import java.util.Map;

import org.junit.jupiter.api.Test;

class CertificateControllerTest {
    @Test
    void generatesPasswordProtectedSigningIdentity() throws Exception {
        byte[] bytes =
                new CertificateController()
                        .generate(
                                Map.of("name", "Fictional Test User", "password", "test-password"))
                        .getBody();
        KeyStore store = KeyStore.getInstance("PKCS12");
        store.load(new ByteArrayInputStream(bytes), "test-password".toCharArray());
        assertNotNull(store.getKey("tearpdf", "test-password".toCharArray()));
        store.getCertificate("tearpdf").verify(store.getCertificate("tearpdf").getPublicKey());
        assertThrows(
                Exception.class,
                () ->
                        KeyStore.getInstance("PKCS12")
                                .load(new ByteArrayInputStream(bytes), "incorrect".toCharArray()));
    }
}
