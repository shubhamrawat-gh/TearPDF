use std::path::PathBuf;
use tauri::command;
use crate::adapters::qpdf::QpdfAdapter;
use crate::engine::adapter::ToolAdapter;
use crate::models::errors::ToolkitError;

#[command]
pub async fn merge_pdfs(input_paths: Vec<String>) -> Result<serde_json::Value, ToolkitError> {
    if input_paths.is_empty() {
        return Err(ToolkitError::InvalidFormat("No input files provided for merge".to_string()));
    }

    let first_input = PathBuf::from(&input_paths[0]);
    let output = first_input.with_file_name("merged_output.pdf");
    let sidecar_path = PathBuf::from("sidecars/qpdf-x86_64-pc-windows-msvc.exe");

    let adapter = QpdfAdapter::new(sidecar_path);
    let params = serde_json::json!({
        "action": "merge",
        "input_paths": input_paths
    });

    let res = adapter.execute(first_input, output, params).await?;
    Ok(serde_json::json!({
        "outputPath": res.output_path.to_string_lossy(),
        "outputSize": res.output_size
    }))
}

#[command]
pub async fn split_pdf(input_path: String, page_ranges: String) -> Result<serde_json::Value, ToolkitError> {
    let input = PathBuf::from(&input_path);
    let output = input.with_extension("split.pdf");
    let sidecar_path = PathBuf::from("sidecars/qpdf-x86_64-pc-windows-msvc.exe");

    let adapter = QpdfAdapter::new(sidecar_path);
    let params = serde_json::json!({
        "action": "split",
        "page_ranges": page_ranges
    });

    let res = adapter.execute(input, output, params).await?;
    Ok(serde_json::json!({
        "outputPath": res.output_path.to_string_lossy(),
        "outputSize": res.output_size
    }))
}

#[command]
pub async fn rotate_pdf(input_path: String, degrees: i64) -> Result<serde_json::Value, ToolkitError> {
    let input = PathBuf::from(&input_path);
    let output = input.with_extension("rotated.pdf");
    let sidecar_path = PathBuf::from("sidecars/qpdf-x86_64-pc-windows-msvc.exe");

    let adapter = QpdfAdapter::new(sidecar_path);
    let params = serde_json::json!({
        "action": "rotate",
        "degrees": degrees
    });

    let res = adapter.execute(input, output, params).await?;
    Ok(serde_json::json!({
        "outputPath": res.output_path.to_string_lossy(),
        "outputSize": res.output_size
    }))
}

#[command]
pub async fn repair_pdf(input_path: String) -> Result<serde_json::Value, ToolkitError> {
    let input = PathBuf::from(&input_path);
    let output = input.with_extension("repaired.pdf");
    let sidecar_path = PathBuf::from("sidecars/qpdf-x86_64-pc-windows-msvc.exe");

    let adapter = QpdfAdapter::new(sidecar_path);
    let params = serde_json::json!({ "action": "repair" });

    let res = adapter.execute(input, output, params).await?;
    Ok(serde_json::json!({
        "outputPath": res.output_path.to_string_lossy(),
        "outputSize": res.output_size
    }))
}
