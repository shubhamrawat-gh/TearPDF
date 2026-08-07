use std::path::PathBuf;
use async_trait::async_trait;
use serde_json::Value;
use crate::models::errors::ToolkitError;

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct JobResult {
    pub output_path: PathBuf,
    pub output_size: u64,
    pub details: Option<Value>,
}

#[async_trait]
pub trait ToolAdapter: Send + Sync {
    fn id(&self) -> &'static str;
    async fn execute(
        &self,
        input: PathBuf,
        output: PathBuf,
        params: Value,
    ) -> Result<JobResult, ToolkitError>;
}
