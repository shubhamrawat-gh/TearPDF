use std::fs::File;
use std::io::Read;
use std::path::Path;
use crate::models::errors::ToolkitError;

pub fn validate_input_path(path: &Path) -> Result<(), ToolkitError> {
    if !path.exists() {
        return Err(ToolkitError::FileNotFound(path.to_string_lossy().to_string()));
    }

    // Flag injection protection: prevent passing paths that start with '-' as positional sidecar args
    if let Some(file_name) = path.file_name() {
        let name_str = file_name.to_string_lossy();
        if name_str.starts_with('-') {
            return Err(ToolkitError::InvalidFormat(
                "Filenames starting with '-' are prohibited to prevent flag injection".to_string(),
            ));
        }
    }

    Ok(())
}

pub fn verify_magic_bytes(path: &Path, expected_type: &str) -> Result<(), ToolkitError> {
    validate_input_path(path)?;

    let mut file = File::open(path).map_err(|e| ToolkitError::IoError(e.to_string()))?;
    let mut header = [0u8; 8];
    let bytes_read = file.read(&mut header).unwrap_or(0);

    if bytes_read < 4 {
        return Err(ToolkitError::InvalidFormat("File header too short".to_string()));
    }

    match expected_type {
        "pdf" => {
            if &header[0..4] != b"%PDF" {
                return Err(ToolkitError::InvalidFormat("File is not a valid PDF document (%PDF header missing)".to_string()));
            }
        }
        "jpeg" | "jpg" => {
            if header[0] != 0xFF || header[1] != 0xD8 || header[2] != 0xFF {
                return Err(ToolkitError::InvalidFormat("File is not a valid JPEG image".to_string()));
            }
        }
        "png" => {
            if &header[0..4] != &[0x89, 0x50, 0x4E, 0x47] {
                return Err(ToolkitError::InvalidFormat("File is not a valid PNG image".to_string()));
            }
        }
        _ => {}
    }

    Ok(())
}
