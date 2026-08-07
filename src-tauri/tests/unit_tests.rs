use std::path::PathBuf;
use tearpdf_lib::models::errors::ToolkitError;
use tearpdf_lib::engine::security::{validate_input_path, verify_magic_bytes};

#[test]
fn test_security_path_validation() {
    let valid_path = PathBuf::from("../test-files/tiny.png");
    assert!(validate_input_path(&valid_path).is_ok());

    let invalid_path = PathBuf::from("../test-files/non_existent.pdf");
    assert!(validate_input_path(&invalid_path).is_err());
}

#[test]
fn test_flag_injection_prevention() {
    let flag_path = PathBuf::from("-dNOPAUSE");
    let res = validate_input_path(&flag_path);
    assert!(res.is_err());
}

#[test]
fn test_magic_bytes_png() {
    let png_path = PathBuf::from("../test-files/tiny.png");
    let res = verify_magic_bytes(&png_path, "png");
    assert!(res.is_ok());
}

#[test]
fn test_magic_bytes_pdf() {
    let pdf_path = PathBuf::from("../test-files/text-only.pdf");
    let res = verify_magic_bytes(&pdf_path, "pdf");
    assert!(res.is_ok());
}
