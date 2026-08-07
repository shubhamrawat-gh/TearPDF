pub mod models;
pub mod engine {
    pub mod adapter;
    pub mod security;
    pub mod sidecar_resolver;
    pub mod events;
    pub mod queue;
}
pub mod adapters {
    pub mod image_crate;
    pub mod ghostscript;
    pub mod qpdf;
    pub mod pdfium;
}
pub mod commands {
    pub mod image_ops;
    pub mod pdf_compress;
    pub mod pdf_structure;
    pub mod pdf_preview;
}

use commands::image_ops::{resize_image, change_dpi};
use commands::pdf_compress::compress_pdf;
use commands::pdf_structure::{merge_pdfs, split_pdf, rotate_pdf, repair_pdf};
use commands::pdf_preview::get_pdf_thumbnail;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            resize_image,
            change_dpi,
            compress_pdf,
            merge_pdfs,
            split_pdf,
            rotate_pdf,
            repair_pdf,
            get_pdf_thumbnail
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
