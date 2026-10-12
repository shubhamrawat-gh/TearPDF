package tearpdf.software.SPDF.controller.api.converters;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;

import lombok.RequiredArgsConstructor;

import tearpdf.software.common.annotations.AutoJobPostMapping;
import tearpdf.software.common.annotations.api.ConvertApi;
import tearpdf.software.common.configuration.RuntimePathConfig;
import tearpdf.software.common.enumeration.ResourceWeight;
import tearpdf.software.common.model.api.PDFFile;
import tearpdf.software.common.model.tool.ToolFormat;
import tearpdf.software.common.model.tool.ToolIO;
import tearpdf.software.common.util.PDFToFile;
import tearpdf.software.common.util.TempFileManager;

@ConvertApi
@RequiredArgsConstructor
public class ConvertPDFToHtml {

    private final TempFileManager tempFileManager;
    private final RuntimePathConfig runtimePathConfig;

    @AutoJobPostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            value = "/pdf/html",
            resourceWeight = ResourceWeight.MEDIUM_WEIGHT)
    @ToolIO(produces = ToolFormat.ZIP)
    @Operation(
            summary = "Convert PDF to HTML",
            description = "This endpoint converts a PDF file to HTML format.")
    public ResponseEntity<Resource> processPdfToHTML(@ModelAttribute PDFFile file)
            throws Exception {
        MultipartFile inputFile = file.getFileInput();
        PDFToFile pdfToFile = new PDFToFile(tempFileManager, runtimePathConfig);
        return pdfToFile.processPdfToHtml(inputFile);
    }
}
