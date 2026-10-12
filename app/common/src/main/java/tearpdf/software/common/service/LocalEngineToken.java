package tearpdf.software.common.service;

import java.util.UUID;

/** Per-process credential for tools invoked by background workspace jobs. */
public final class LocalEngineToken {
    public static final String HEADER = "X-TearPDF-Engine";
    public static final String VALUE = UUID.randomUUID().toString() + UUID.randomUUID();

    private LocalEngineToken() {}
}
