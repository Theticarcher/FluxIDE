use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct CompileResult {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub html: Option<String>,
    pub js: Option<String>,
    pub css: Option<String>,
}

#[tauri::command]
pub async fn compile_flux_file(file_path: String, output_dir: String) -> Result<CompileResult, String> {
    // Try to run the flux CLI
    let output = Command::new("flux")
        .args(["build", &file_path, "-o", &output_dir])
        .output();

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let success = output.status.success();

            // If successful, try to read the generated files
            let (html, js, css) = if success {
                let base_name = std::path::Path::new(&file_path)
                    .file_stem()
                    .and_then(|s| s.to_str())
                    .unwrap_or("output");

                let html_path = format!("{}/{}.html", output_dir, base_name);
                let js_path = format!("{}/{}.js", output_dir, base_name);
                let css_path = format!("{}/{}.css", output_dir, base_name);

                (
                    std::fs::read_to_string(&html_path).ok(),
                    std::fs::read_to_string(&js_path).ok(),
                    std::fs::read_to_string(&css_path).ok(),
                )
            } else {
                (None, None, None)
            };

            Ok(CompileResult {
                success,
                stdout,
                stderr,
                html,
                js,
                css,
            })
        }
        Err(e) => {
            // Flux CLI not found or other error
            Ok(CompileResult {
                success: false,
                stdout: String::new(),
                stderr: format!("Failed to run flux compiler: {}. Make sure flux is installed and in your PATH.", e),
                html: None,
                js: None,
                css: None,
            })
        }
    }
}
