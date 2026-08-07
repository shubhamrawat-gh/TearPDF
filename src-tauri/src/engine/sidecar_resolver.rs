use std::path::PathBuf;
use tauri::AppHandle;
use crate::models::errors::ToolkitError;

pub struct SidecarResolver;

impl SidecarResolver {
    pub fn resolve_sidecar(app: Option<&AppHandle>, binary_name: &str) -> Result<PathBuf, ToolkitError> {
        // 1. Check local sidecars folder in development workspace
        let dev_path = PathBuf::from("sidecars").join(format!("{}.exe", binary_name));
        if dev_path.exists() {
            return Ok(dev_path);
        }

        // 2. Check target directory sidecars
        let target_path = PathBuf::from("../src-tauri/sidecars").join(format!("{}.exe", binary_name));
        if target_path.exists() {
            return Ok(target_path);
        }

        // 3. Fallback to system PATH binary if sidecar file is not statically placed
        if let Ok(path) = which::which(binary_name) {
            return Ok(path);
        }

        Err(ToolkitError::SidecarExecutionFailed {
            sidecar: binary_name.to_string(),
            message: format!("Sidecar binary executable '{}.exe' not found in sidecars directory or system PATH", binary_name),
        })
    }
}
