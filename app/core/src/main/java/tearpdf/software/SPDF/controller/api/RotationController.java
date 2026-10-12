package tearpdf.software.SPDF.controller.api;

import java.io.IOException;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageTree;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;

import lombok.RequiredArgsConstructor;

import tearpdf.software.SPDF.config.swagger.StandardPdfResponse;
import tearpdf.software.SPDF.model.api.general.RotatePDFRequest;
import tearpdf.software.common.annotations.AutoJobPostMapping;
import tearpdf.software.common.annotations.api.GeneralApi;
import tearpdf.software.common.enumeration.ResourceWeight;
import tearpdf.software.common.model.tool.ToolFormat;
import tearpdf.software.common.model.tool.ToolIO;
import tearpdf.software.common.service.CustomPDFDocumentFactory;
import tearpdf.software.common.util.ExceptionUtils;
import tearpdf.software.common.util.GeneralUtils;
import tearpdf.software.common.util.TempFileManager;
import tearpdf.software.common.util.WebResponseUtils;

@GeneralApi
@RequiredArgsConstructor
public class RotationController {

    private final CustomPDFDocumentFactory pdfDocumentFactory;
    private final TempFileManager tempFileManager;

    @AutoJobPostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            value = "/rotate-pdf",
            resourceWeight = ResourceWeight.SMALL_WEIGHT)
    @StandardPdfResponse
    @ToolIO(produces = ToolFormat.PDF)
    @Operation(
            summary = "Rotate a PDF file",
            description =
                    "This endpoint rotates a given PDF file by a specified angle. The angle must be"
                            + " a multiple of 90.")
    public ResponseEntity<Resource> rotatePDF(@ModelAttribute RotatePDFRequest request)
            throws IOException {
        MultipartFile pdfFile = request.getFileInput();
        Integer angle = request.getAngle();

        // Validate the angle is a multiple of 90
        if (angle % 90 != 0) {
            throw ExceptionUtils.createIllegalArgumentException(
                    "error.angleNotMultipleOf90", "Angle must be a multiple of 90");
        }

        // Load the PDF document with proper resource management
        try (PDDocument document = pdfDocumentFactory.load(request)) {

            // Get the list of pages in the document
            PDPageTree pages = document.getPages();

            for (PDPage page : pages) {
                page.setRotation(page.getRotation() + angle);
            }

            // Return the rotated PDF as a response
            return WebResponseUtils.pdfDocToWebResponse(
                    document,
                    GeneralUtils.generateFilename(pdfFile.getOriginalFilename(), "_rotated.pdf"),
                    tempFileManager);
        }
    }
}
