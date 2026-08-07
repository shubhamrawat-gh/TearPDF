use std::path::PathBuf;
use std::time::Duration;
use async_trait::async_trait;
use serde_json::Value;
use tokio::process::Command;
use crate::engine::adapter::{ToolAdapter, JobResult};
use crate::engine::security::verify_magic_bytes;
use crate::models::errors::ToolkitError;

pub struct GhostscriptAdapter {
    sidecar_path: PathBuf,
}

impl GhostscriptAdapter {
    pub fn new(sidecar_path: PathBuf) -> Self {
        Self { sidecar_path }
    }
}

#[async_trait]
impl ToolAdapter for GhostscriptAdapter {
    fn id(&self) -> &'static str {
        "ghostscript"
    }

    async fn execute(
        &self,
        input: PathBuf,
        output: PathBuf,
        params: Value,
    ) -> Result<JobResult, ToolkitError> {
        verify_magic_bytes(&input, "pdf")?;

        let preset = params.get("preset").and_then(|v| v.as_str()).unwrap_or("ebook");
        let pdf_setting_flag = match preset {
            "screen" => "-dPDFSETTINGS=/screen",
            "printer" => "-dPDFSETTINGS=/printer",
            "prepress" => "-dPDFSETTINGS=/prepress",
            _ => "-dPDFSETTINGS=/ebook",
        };

        let mut output_arg = std::ffi::OsString::from("-sOutputFile=");
        output_arg.push(output.as_os_str());

        // Construct command using explicit argument arrays -- NO shell interpolation
        let mut cmd = Command::new(&self.sidecar_path);
        cmd.arg("-dNOPAUSE")
           .arg("-dBATCH")
           .arg("-sDEVICE=pdfwrite")
           .arg(pdf_setting_flag)
           .arg("-dCompatibilityLevel=1.4")
           .arg(output_arg)
           .arg(&input);

        let timeout_duration = Duration::from_secs(120);
        let output_res = tokio::time::timeout(timeout_duration, cmd.output()).await
            .map_err(|_| ToolkitError::Timeout(120))?
            .map_err(|e| ToolkitError::SidecarExecutionFailed {
                sidecar: "Ghostscript".to_string(),
                message: e.to_string(),
            })?;

        if !output_res.status.success() {
            let stderr = String::from_utf8_lossy(&output_res.stderr);
            if stderr.contains("Password") || stderr.contains("Encrypted") {
                return Err(ToolkitError::PasswordProtected(input.to_string_lossy().to_string()));
            }
            return Err(ToolkitError::SidecarExecutionFailed {
                sidecar: "Ghostscript".to_string(),
                message: stderr.to_string(),
            });
        }

        let metadata = std::fs::metadata(&output)?;
        Ok(JobResult {
            output_path: output,
            output_size: metadata.len(),
            details: Some(serde_json::json!({ "preset": preset })),
        })
    }
}
