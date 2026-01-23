use serde::{Deserialize, Serialize};
use std::process::Command;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct CompileResult {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub html: Option<String>,
    pub js: Option<String>,
    pub css: Option<String>,
}

/// Get the path to the bundled Flux compiler
fn get_bundled_compiler_path() -> Option<PathBuf> {
    // In development, the compiler is in the flux-compiler submodule
    // In production, it's bundled with the app

    // Try to find the bundled compiler relative to the executable
    if let Ok(exe_path) = std::env::current_exe() {
        // Check for bundled compiler in resources (production)
        if let Some(exe_dir) = exe_path.parent() {
            // macOS: FluxIDE.app/Contents/MacOS/../Resources/flux-compiler
            let macos_resource = exe_dir.join("../Resources/flux-compiler/src/cli/index.ts");
            if macos_resource.exists() {
                return Some(macos_resource);
            }

            // Linux/Windows: alongside executable
            let resource = exe_dir.join("flux-compiler/src/cli/index.ts");
            if resource.exists() {
                return Some(resource);
            }
        }
    }

    // Development: check relative to working directory
    let dev_path = PathBuf::from("flux-compiler/src/cli/index.ts");
    if dev_path.exists() {
        return Some(dev_path);
    }

    // Also check from src-tauri directory
    let dev_path2 = PathBuf::from("../flux-compiler/src/cli/index.ts");
    if dev_path2.exists() {
        return Some(dev_path2);
    }

    None
}

#[tauri::command]
pub async fn compile_flux_file(file_path: String, output_dir: String) -> Result<CompileResult, String> {
    // First try the bundled compiler
    if let Some(compiler_path) = get_bundled_compiler_path() {
        let output = Command::new("npx")
            .args(["tsx", compiler_path.to_str().unwrap(), "build", &file_path, "-o", &output_dir])
            .output();

        if let Ok(output) = output {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let success = output.status.success();

            let (html, js, css) = if success {
                read_compiled_files(&file_path, &output_dir)
            } else {
                (None, None, None)
            };

            return Ok(CompileResult {
                success,
                stdout,
                stderr,
                html,
                js,
                css,
            });
        }
    }

    // Fall back to system flux command
    let output = Command::new("flux")
        .args(["build", &file_path, "-o", &output_dir])
        .output();

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let success = output.status.success();

            let (html, js, css) = if success {
                read_compiled_files(&file_path, &output_dir)
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
            Ok(CompileResult {
                success: false,
                stdout: String::new(),
                stderr: format!("Failed to run flux compiler: {}. Make sure flux is installed and in your PATH, or check the bundled compiler.", e),
                html: None,
                js: None,
                css: None,
            })
        }
    }
}

/// Read the compiled output files
fn read_compiled_files(file_path: &str, output_dir: &str) -> (Option<String>, Option<String>, Option<String>) {
    let base_name = std::path::Path::new(file_path)
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
}
