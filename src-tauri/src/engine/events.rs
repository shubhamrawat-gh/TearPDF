use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchProgressPayload {
    pub job_id: String,
    pub status: String, // "pending" | "processing" | "completed" | "failed"
    pub progress: u32,
    pub current_file: Option<String>,
    pub completed_count: usize,
    pub total_count: usize,
    pub error: Option<String>,
}
