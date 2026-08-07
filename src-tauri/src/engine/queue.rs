use std::path::PathBuf;
use std::sync::Arc;
use rayon::prelude::*;
use serde_json::Value;
use tauri::AppHandle;
use crate::engine::adapter::{ToolAdapter, JobResult};
use crate::engine::events::emit_batch_progress;

pub struct RayonBatchQueue {
    app: AppHandle,
}

impl RayonBatchQueue {
    pub fn new(app: AppHandle) -> Self {
        Self { app }
    }

    pub fn execute_batch(
        &self,
        batch_id: String,
        adapter: Arc<dyn ToolAdapter + Send + Sync>,
        jobs: Vec<(String, PathBuf, PathBuf, Value)>,
    ) {
        let total_jobs = jobs.len();
        let app_handle = self.app.clone();

        std::thread::spawn(move || {
            jobs.into_par_iter().enumerate().for_each(|(index, (job_id, input, output, params))| {
                let adapter = adapter.clone();
                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build();

                if let Ok(rt) = rt {
                    let result = rt.block_on(adapter.execute(input, output, params));
                    match result {
                        Ok(res) => {
                            let progress = Math_percent(index + 1, total_jobs);
                            let _ = emit_batch_progress(
                                &app_handle,
                                &batch_id,
                                &job_id,
                                progress,
                                "completed",
                                None,
                                Some(res.output_size),
                            );
                        }
                        Err(err) => {
                            let _ = emit_batch_progress(
                                &app_handle,
                                &batch_id,
                                &job_id,
                                0,
                                "failed",
                                Some(&err.to_string()),
                                None,
                            );
                        }
                    }
                }
            });
        });
    }
}

fn Math_percent(current: usize, total: usize) -> u32 {
    if total == 0 {
        return 100;
    }
    ((current as f64 / total as f64) * 100.0) as u32
}
