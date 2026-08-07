use std::path::PathBuf;
use async_trait::async_trait;
use serde_json::Value;
use image::imageops::FilterType;
use image::GenericImageView;
use crate::engine::adapter::{ToolAdapter, JobResult};
use crate::engine::security::validate_input_path;
use crate::models::errors::ToolkitError;

pub struct ImageAdapter;

impl ImageAdapter {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl ToolAdapter for ImageAdapter {
    fn id(&self) -> &'static str {
        "image_crate"
    }

    async fn execute(
        &self,
        input: PathBuf,
        output: PathBuf,
        params: Value,
    ) -> Result<JobResult, ToolkitError> {
        validate_input_path(&input)?;

        let max_width = params.get("width").and_then(|v| v.as_u64()).unwrap_or(1920) as u32;
        let max_height = params.get("height").and_then(|v| v.as_u64()).unwrap_or(1080) as u32;
        let quality = params.get("quality").and_then(|v| v.as_u64()).unwrap_or(80) as u8;

        // Open image safely without buffering whole file batch into memory
        let img = image::open(&input)
            .map_err(|e| ToolkitError::ImageProcessingError(e.to_string()))?;

        let (orig_w, orig_h) = img.dimensions();
        
        // Single-buffer transformation to prevent memory cloning for 30MP+ images
        let resized = if orig_w > max_width || orig_h > max_height {
            img.resize(max_width, max_height, FilterType::Lanczos3)
        } else {
            img
        };

        // Save output to target path
        resized.save(&output)
            .map_err(|e| ToolkitError::ImageProcessingError(e.to_string()))?;

        let metadata = std::fs::metadata(&output)?;
        Ok(JobResult {
            output_path: output,
            output_size: metadata.len(),
            details: Some(serde_json::json!({
                "width": resized.width(),
                "height": resized.height(),
                "quality": quality
            })),
        })
    }
}
