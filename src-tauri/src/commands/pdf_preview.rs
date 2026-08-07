use std::path::PathBuf;
use tauri::command;
use crate::adapters::pdfium::PdfiumPreviewAdapter;
use crate::models::errors::ToolkitError;

#[command]
pub async fn get_pdf_thumbnail(
    pdf_path: String,
    page_number: u16,
    target_width: Option<u32>,
) -> Result<serde_json::Value, ToolkitError> {
    let path = PathBuf::from(&pdf_path);
    let adapter = PdfiumPreviewAdapter::new();
    let width_param = target_width.unwrap_or(400);

    let (width, height, data_url) = adapter.render_page_thumbnail(&path, page_number, width_param)?;

    Ok(serde_json::json!({
        "pageNumber": page_number,
        "width": width,
        "height": height,
        "thumbnailUrl": data_url
    }))
}
