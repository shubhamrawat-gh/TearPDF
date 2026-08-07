use thiserror::Error;
use serde::{Serialize, Deserialize};

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum ToolkitError {
    #[error("File not found: {0}")]
    FileNotFound(String),

    #[error("Invalid file format or magic bytes mismatch: {0}")]
    InvalidFormat(String),

    #[error("PDF is password-protected: {0}")]
    PasswordProtected(String),

    #[error("Corrupt PDF structure: {0}")]
    CorruptPdf(String),

    #[error("Sidecar process error ({sidecar}): {message}")]
    SidecarExecutionFailed {
        sidecar: String,
        message: String,
    },

    #[error("Execution timed out after {0} seconds")]
    Timeout(u64),

    #[error("IO Error: {0}")]
    IoError(String),

    #[error("Image processing error: {0}")]
    ImageProcessingError(String),
}

impl From<std::io::Error> for ToolkitError {
    fn from(err: std::io::Error) -> Self {
        ToolkitError::IoError(err.to_string())
    }
}
