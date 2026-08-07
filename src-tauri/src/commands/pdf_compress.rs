use std::path::PathBuf;
use tauri::command;
use crate::adapters::ghostscript::GhostscriptAdapter;
use crate::engine::adapter::ToolAdapter;
use crate::models::errors::ToolkitError;

#[command]
pub async fn compress_pdf(
    input_path: String,
    preset: String,
    jpeg_quality: Option<u8>,
) -> Result<serde_json::Value, ToolkitError> {
    let input = PathBuf::from(&input_path);
    let output = input.with_extension("compressed.pdf");

    // In production, sidecar path is resolved dynamically via app_handle.path().resource_dir()
    let sidecar_path = PathBuf::from("sidecars/gs-x86_64-pc-windows-msvc.exe");
    let adapter = GhostscriptAdapter::new(sidecar_path);

    let params = serde_json::json!({
        "preset": preset,
        "jpeg_quality": jpeg_quality
    });

    let res = adapter.execute(input, output, params).await?;
    Ok(serde_json::json!({
        "outputPath": res.output_path.to_string_lossy(),
        "outputSize": res.output_size
    }))
}
