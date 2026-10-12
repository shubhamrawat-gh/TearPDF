package tearpdf.software.SPDF.workspace;

import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.security.*;
import java.security.cert.Certificate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

/** Creates a personal signing identity locally; no certificate authority is contacted. */
@RestController
@RequestMapping("/api/v1/workspace/certificates")
public class CertificateController {
    @PostMapping("/self-signed")
    public ResponseEntity<byte[]> generate(@RequestBody Map<String, String> body) throws Exception {
        String name = body.getOrDefault("name", "TearPDF Local User").trim();
        String password = body.getOrDefault("password", "");
        if (name.isBlank() || name.length() > 120 || password.length() < 8)
            throw new IllegalArgumentException(
                    "A name and password of at least eight characters are required");
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(3072);
        KeyPair pair = generator.generateKeyPair();
        var dn = new X500Name("CN=" + name.replaceAll("[,=+<>#;\\\\\"]", " "));
        Instant now = Instant.now();
        var builder =
                new JcaX509v3CertificateBuilder(
                        dn,
                        new BigInteger(128, new SecureRandom()),
                        Date.from(now.minus(1, ChronoUnit.DAYS)),
                        Date.from(now.plus(365, ChronoUnit.DAYS)),
                        dn,
                        pair.getPublic());
        var signer = new JcaContentSignerBuilder("SHA256withRSA").build(pair.getPrivate());
        var certificate = new JcaX509CertificateConverter().getCertificate(builder.build(signer));
        KeyStore keystore = KeyStore.getInstance("PKCS12");
        keystore.load(null, password.toCharArray());
        keystore.setKeyEntry(
                "tearpdf",
                pair.getPrivate(),
                password.toCharArray(),
                new Certificate[] {certificate});
        var output = new ByteArrayOutputStream();
        keystore.store(output, password.toCharArray());
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=tearpdf-identity.p12")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(output.toByteArray());
    }
}
