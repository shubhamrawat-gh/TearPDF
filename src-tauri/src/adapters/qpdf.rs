use std::path::PathBuf;
use std::time::Duration;
use async_trait::async_trait;
use serde_json::Value;
use tokio::process::Command;
use crate::engine::adapter::{ToolAdapter, JobResult};
use crate::engine::security::{validate_input_path, verify_magic_bytes};
use crate::models::errors::ToolkitError;

pub struct QpdfAdapter {
    sidecar_path: PathBuf,
}

impl QpdfAdapter {
    pub fn new(sidecar_path: PathBuf) -> Self {
        Self { sidecar_path }
    }
}

#[async_trait]
impl ToolAdapter for QpdfAdapter {
    fn id(&self) -> &'static str {
        "qpdf"
    }

    async fn execute(
        &self,
        input: PathBuf,
        output: PathBuf,
        params: Value,
    ) -> Result<JobResult, ToolkitError> {
        validate_input_path(&input)?;

        let action = params.get("action").and_then(|v| v.as_str()).unwrap_or("repair");
        let mut cmd = Command::new(&self.sidecar_path);

        match action {
            "merge" => {
                let inputs = params.get("input_paths")
                    .and_then(|v| v.as_array())
                    .ok_or_else(|| ToolkitError::InvalidFormat("Missing input_paths for merge".to_string()))?;

                cmd.arg("--empty").arg("--pages");
                for p_val in inputs {
                    if let Some(p_str) = p_val.as_str() {
                        let path_buf = PathBuf::from(p_str);
                        validate_input_path(&path_buf)?;
                        cmd.arg(path_buf).arg("1-z");
                    }
                }
                cmd.arg("--").arg(&output);
            }
            "split" => {
                verify_magic_bytes(&input, "pdf")?;
                let ranges = params.get("page_ranges").and_then(|v| v.as_str()).unwrap_or("1-z");
                cmd.arg(&input).arg("--pages").arg(&input).arg(ranges).arg("--").arg(&output);
            }
            "rotate" => {
                verify_magic_bytes(&input, "pdf")?;
                let degrees = params.get("degrees").and_then(|v| v.as_i64()).unwrap_or(90);
                let rot_arg = match degrees {
                    180 => "+180",
                    270 => "+270",
                    _ => "+90",
                };
                cmd.arg(&input).arg("--rotate").arg(rot_arg).arg("--").arg(&output);
            }
            "repair" | _ => {
                cmd.arg("--check").arg(&input).arg("--linearize").arg("--").arg(&output);
            }
        }

        let timeout_duration = Duration::from_secs(120);
        let output_res = tokio::time::timeout(timeout_duration, cmd.output()).await
            .map_err(|_| ToolkitError::Timeout(120))?
            .map_err(|e| ToolkitError::SidecarExecutionFailed {
                sidecar: "qpdf".to_string(),
                message: e.to_string(),
            })?;

        if !output_res.status.success() {
            let stderr = String::from_utf8_lossy(&output_res.stderr);
            if stderr.contains("password") || stderr.contains("encrypted") {
                return Err(ToolkitError::PasswordProtected(input.to_string_lossy().to_string()));
            }
            if output_res.status.code() != Some(3) {
                return Err(ToolkitError::SidecarExecutionFailed {
                    sidecar: "qpdf".to_string(),
                    message: stderr.to_string(),
                });
            }
        }

        let metadata = std::fs::metadata(&output)?;
        Ok(JobResult {
            output_path: output,
            output_size: metadata.len(),
            details: Some(serde_json::json!({ "action": action })),
        })
    }
}
