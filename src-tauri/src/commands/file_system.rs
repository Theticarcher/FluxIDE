use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub is_file: bool,
    pub extension: Option<String>,
}

#[tauri::command]
pub async fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err(format!("Directory does not exist: {}", path));
    }

    if !dir_path.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let mut entries: Vec<FileEntry> = Vec::new();

    match fs::read_dir(dir_path) {
        Ok(read_dir) => {
            for entry in read_dir.flatten() {
                let entry_path = entry.path();
                let metadata = entry.metadata().ok();

                let file_entry = FileEntry {
                    name: entry.file_name().to_string_lossy().to_string(),
                    path: entry_path.to_string_lossy().to_string(),
                    is_dir: metadata.as_ref().map(|m| m.is_dir()).unwrap_or(false),
                    is_file: metadata.as_ref().map(|m| m.is_file()).unwrap_or(false),
                    extension: entry_path
                        .extension()
                        .map(|e| e.to_string_lossy().to_string()),
                };

                entries.push(file_entry);
            }
        }
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    }

    // Sort: directories first, then files, both alphabetically
    entries.sort_by(|a, b| {
        match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(entries)
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub async fn create_file(path: String) -> Result<(), String> {
    fs::File::create(&path).map_err(|e| format!("Failed to create file: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
pub async fn delete_path(path: String) -> Result<(), String> {
    let p = Path::new(&path);

    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| format!("Failed to delete directory: {}", e))
    } else {
        fs::remove_file(p).map_err(|e| format!("Failed to delete file: {}", e))
    }
}

#[tauri::command]
pub async fn rename_path(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path).map_err(|e| format!("Failed to rename: {}", e))
}
