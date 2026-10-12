package tearpdf.software.SPDF.service;

import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

@Service
public class PdfMetricsService {
    private final AtomicLong operations = new AtomicLong();
    private final AtomicLong pdfs = new AtomicLong();

    public boolean isEnabled() {
        return true;
    }

    public void recordOperation(int count) {
        operations.incrementAndGet();
        pdfs.addAndGet(Math.max(0, count));
    }

    public long getOperations() {
        return operations.get();
    }

    public long getPdfs() {
        return pdfs.get();
    }
}
