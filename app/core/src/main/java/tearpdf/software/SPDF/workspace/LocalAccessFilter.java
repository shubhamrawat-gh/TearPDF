package tearpdf.software.SPDF.workspace;

import java.io.IOException;
import java.net.URI;
import java.util.*;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import tearpdf.software.common.service.LocalEngineToken;

@Component
public class LocalAccessFilter extends OncePerRequestFilter {
    private final LocalLock lock;
    private final WorkspacePreferences preferences;

    public LocalAccessFilter(LocalLock lock, WorkspacePreferences preferences) {
        this.lock = lock;
        this.preferences = preferences;
    }

    public static String token(HttpServletRequest request) {
        if (request.getCookies() != null)
            for (Cookie cookie : request.getCookies())
                if (cookie.getName().equals("tearpdf-session")) return cookie.getValue();
        return null;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String origin = request.getHeader("Origin");
        if (origin != null) {
            try {
                String host = URI.create(origin).getHost();
                if (!Set.of("localhost", "127.0.0.1", "::1", "[::1]").contains(host)) {
                    response.sendError(403, "Local origins only");
                    return;
                }
            } catch (Exception e) {
                response.sendError(403);
                return;
            }
        }
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader(
                "Content-Security-Policy",
                "default-src 'self' blob: data:; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' blob:; worker-src 'self' blob:; frame-src 'self' blob:; object-src 'none'");
        String path = request.getRequestURI();
        if (path.contains("/timestamp-pdf") && !preferences.timestampEnabled()) {
            response.setStatus(403);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Configure a timestamp server in Settings first\"}");
            return;
        }
        if (path.startsWith("/api/")
                && !path.startsWith("/api/v1/workspace/auth/")
                && !LocalEngineToken.VALUE.equals(request.getHeader(LocalEngineToken.HEADER))
                && !lock.valid(token(request))) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Workspace locked\"}");
            return;
        }
        if (path.contains("url-to-pdf")
                || path.contains("/convert/url/pdf")
                || path.contains("fetch-pdf-from-url")
                || path.contains("/integration/")) {
            response.setStatus(403);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Network tools are disabled in TearPDF\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
