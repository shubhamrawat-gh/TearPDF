package tearpdf.software.SPDF.workspace;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.nio.file.Path;
import java.util.Map;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import tearpdf.software.common.model.ApplicationProperties;

class LocalAccessFilterTest {
    @TempDir Path directory;

    @Test
    void unconfiguredTimestampIsRejectedBeforeMultipartDispatch() throws Exception {
        try (var store = new LibraryStore(directory.toString())) {
            var preferences = new WorkspacePreferences(store, new ApplicationProperties());
            var filter = new LocalAccessFilter(new LocalLock(store), preferences);
            var request = new MockHttpServletRequest("POST", "/api/v1/security/timestamp-pdf");
            request.setContentType("multipart/form-data; boundary=fictional");
            var response = new MockHttpServletResponse();
            var chain = mock(FilterChain.class);
            filter.doFilter(request, response, chain);
            assertEquals(403, response.getStatus());
            assertFalse(response.isCommitted());
            assertTrue(response.getContentAsString().contains("Configure a timestamp server"));
            verifyNoInteractions(chain);
            preferences.save(Map.of("timestampServer", "http://127.0.0.1:9999"));
            filter.doFilter(new MockHttpServletRequest("POST", request.getRequestURI()), new MockHttpServletResponse(), chain);
            verify(chain).doFilter(any(), any());
        }
    }
}
