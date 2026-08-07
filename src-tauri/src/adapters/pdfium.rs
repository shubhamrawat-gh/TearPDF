use std::path::PathBuf;
use pdfium_render::prelude::*;
use base64::Engine;
use crate::models::errors::ToolkitError;
use crate::engine::security::verify_magic_bytes;

pub struct PdfiumPreviewAdapter;

impl PdfiumPreviewAdapter {
    pub fn new() -> Self {
        Self
    }

    pub fn render_page_thumbnail(
        &self,
        pdf_path: &PathBuf,
        page_number: u16,
        target_width: u32,
    ) -> Result<(u32, u32, String), ToolkitError> {
        verify_magic_bytes(pdf_path, "pdf")?;

        // Initialize PDFium bindings (dynamically links to system or sidecar pdfium.dll)
        let pdfium = Pdfium::new(
            Pdfium::bind_to_library(Pdfium::pdfium_platform_library_name_at_path("./sidecars"))
                .or_else(|_| Pdfium::bind_to_system_library())
                .map_err(|e| ToolkitError::SidecarExecutionFailed {
                    sidecar: "pdfium".to_string(),
                    message: format!("Failed to bind pdfium library: {}", e),
                })?
        );

        let document = pdfium.load_pdf_from_file(pdf_path, None)
            .map_err(|e| ToolkitError::CorruptPdf(e.to_string()))?;

        let pages = document.pages();
        let page = pages.get(page_number.into())
            .map_err(|_| ToolkitError::InvalidFormat("Requested page out of bounds".to_string()))?;

        let render_config = PdfRenderConfig::new()
            .set_target_width((target_width as u16).into());

        let image_res = page.render_with_config(&render_config)
            .map_err(|e| ToolkitError::ImageProcessingError(e.to_string()))?
            .as_image()
            .map_err(|e| ToolkitError::ImageProcessingError(e.to_string()))?;

        let width = image_res.width();
        let height = image_res.height();

        let mut bytes: Vec<u8> = Vec::new();
        let mut cursor = std::io::Cursor::new(&mut bytes);
        image_res.write_to(&mut cursor, image::ImageFormat::Png)
            .map_err(|e| ToolkitError::ImageProcessingError(e.to_string()))?;

        let base64_str = base64::engine::general_purpose::STANDARD.encode(&bytes);
        Ok((width, height, format!("data:image/png;base64,{}", base64_str)))
    }
}
