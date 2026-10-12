package tearpdf.software.SPDF.workspace;

import java.util.*;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.*;

@RestController
@RequestMapping("/api/v1/workspace/auth")
public class LocalLockController {
    private final LocalLock lock;

    public LocalLockController(LocalLock lock) {
        this.lock = lock;
    }

    @GetMapping("/status")
    public Object status(HttpServletRequest request) {
        return Map.of(
                "configured",
                lock.configured(),
                "locked",
                !lock.valid(LocalAccessFilter.token(request)));
    }

    @PostMapping("/unlock")
    public ResponseEntity<?> unlock(@RequestBody Map<String, String> body) throws Exception {
        String token = lock.unlock(body.getOrDefault("passcode", ""));
        return ResponseEntity.ok()
                .header(
                        "Set-Cookie",
                        ResponseCookie.from("tearpdf-session", token)
                                .httpOnly(true)
                                .sameSite("Strict")
                                .path("/")
                                .maxAge(43200)
                                .build()
                                .toString())
                .body(Map.of("unlocked", true));
    }

    @PostMapping("/passcode")
    public Object configure(@RequestBody Map<String, String> body, HttpServletRequest request)
            throws Exception {
        if (!lock.valid(LocalAccessFilter.token(request)))
            return ResponseEntity.status(401).build();
        lock.configure(body.getOrDefault("passcode", ""));
        return Map.of("configured", lock.configured());
    }

    @PostMapping("/lock")
    public void logout(HttpServletRequest request) {
        lock.logout(LocalAccessFilter.token(request));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> error(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
