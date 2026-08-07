use std::path::PathBuf;
use tauri::command;
use crate::adapters::image_crate::ImageAdapter;
use crate::engine::adapter::ToolAdapter;
use crate::models::errors::ToolkitError;

#[command]
pub async fn resize_image(
    input_path: String,
    width: Option<u32>,
    height: Option<u32>,
    quality: Option<u8>,
    format: Option<String>,
) -> Result<serde_json::Value, ToolkitError> {
    let input = PathBuf::from(&input_path);
    let output = input.with_extension(format.as_deref().unwrap_or("resized.webp"));

    let adapter = ImageAdapter::new();
    let params = serde_json::json!({
        "width": width,
        "height": height,
        "quality": quality,
        "format": format
    });

    let res = adapter.execute(input, output.clone(), params).await?;
    Ok(serde_json::json!({
        "outputPath": res.output_path.to_string_lossy(),
        "outputSize": res.output_size
    }))
}

#[command]
pub async fn change_dpi(
    input_path: String,
    target_dpi: u32,
    mode: String,
) -> Result<serde_json::Value, ToolkitError> {
    let input = PathBuf::from(&input_path);
    let output = input.with_extension("dpi.png");

    let adapter = ImageAdapter::new();
    let params = serde_json::json!({
        "target_dpi": target_dpi,
        "mode": mode
    });

    let res = adapter.execute(input, output, params).await?;
    Ok(serde_json::json!({
        "outputPath": res.output_path.to_string_lossy(),
        "outputSize": res.output_size
    }))
}
