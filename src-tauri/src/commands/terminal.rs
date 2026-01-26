use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::Arc;
use std::thread;

use parking_lot::Mutex;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;

/// Represents a terminal session
struct TerminalSession {
    writer: Box<dyn Write + Send>,
    master: Box<dyn portable_pty::MasterPty + Send>,
}

/// Global state for terminal sessions
pub struct TerminalState {
    sessions: Arc<Mutex<HashMap<String, TerminalSession>>>,
}

impl Default for TerminalState {
    fn default() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TerminalInfo {
    pub id: String,
    pub shell: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct TerminalOutput {
    pub id: String,
    pub data: Vec<u8>,
}

/// Spawn a new terminal session
#[tauri::command]
pub async fn terminal_spawn(
    app: AppHandle,
    state: State<'_, TerminalState>,
    shell: Option<String>,
    cwd: Option<String>,
) -> Result<TerminalInfo, String> {
    let pty_system = native_pty_system();

    // Create the PTY with default size
    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to create PTY: {}", e))?;

    // Determine the shell to use
    let shell_path = shell.unwrap_or_else(|| {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
    });

    // Build the command
    let mut cmd = CommandBuilder::new(&shell_path);

    // Set working directory if provided
    if let Some(ref dir) = cwd {
        cmd.cwd(dir);
    }

    // Set environment variables for proper terminal behavior
    cmd.env("TERM", "xterm-256color");
    cmd.env("COLORTERM", "truecolor");

    // Preserve important environment variables
    if let Ok(lang) = std::env::var("LANG") {
        cmd.env("LANG", lang);
    } else {
        cmd.env("LANG", "en_US.UTF-8");
    }

    if let Ok(path) = std::env::var("PATH") {
        cmd.env("PATH", path);
    }

    if let Ok(home) = std::env::var("HOME") {
        cmd.env("HOME", home);
    }

    if let Ok(user) = std::env::var("USER") {
        cmd.env("USER", user);
    }

    // Spawn the shell
    let mut child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    // Generate a unique ID for this terminal
    let terminal_id = Uuid::new_v4().to_string();

    // Get reader and writer from master
    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to clone reader: {}", e))?;

    let writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("Failed to get writer: {}", e))?;

    // Create the session - store the master to keep PTY alive and for resize
    let session = TerminalSession {
        writer,
        master: pair.master,
    };

    // Store the session
    {
        let mut sessions = state.sessions.lock();
        sessions.insert(terminal_id.clone(), session);
    }

    // Clone for the reader thread
    let terminal_id_clone = terminal_id.clone();
    let app_clone = app.clone();
    let sessions_clone = state.sessions.clone();

    // Spawn a thread to read output and emit events
    thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => {
                    // EOF - terminal closed
                    let _ = app_clone.emit("terminal-closed", &terminal_id_clone);
                    break;
                }
                Ok(n) => {
                    // Send raw bytes to preserve all control sequences
                    let data = buf[..n].to_vec();
                    let output = TerminalOutput {
                        id: terminal_id_clone.clone(),
                        data,
                    };
                    let _ = app_clone.emit("terminal-output", output);
                }
                Err(e) => {
                    eprintln!("Terminal read error: {}", e);
                    let _ = app_clone.emit("terminal-closed", &terminal_id_clone);
                    break;
                }
            }
        }

        // Clean up session when reader exits
        let mut sessions = sessions_clone.lock();
        sessions.remove(&terminal_id_clone);

        // Try to wait for child process
        let _ = child.wait();
    });

    Ok(TerminalInfo {
        id: terminal_id,
        shell: shell_path,
    })
}

/// Write data to a terminal
#[tauri::command]
pub async fn terminal_write(
    state: State<'_, TerminalState>,
    id: String,
    data: Vec<u8>,
) -> Result<(), String> {
    let mut sessions = state.sessions.lock();

    if let Some(session) = sessions.get_mut(&id) {
        session
            .writer
            .write_all(&data)
            .map_err(|e| format!("Failed to write to terminal: {}", e))?;
        session
            .writer
            .flush()
            .map_err(|e| format!("Failed to flush terminal: {}", e))?;
        Ok(())
    } else {
        Err(format!("Terminal {} not found", id))
    }
}

/// Resize a terminal
#[tauri::command]
pub async fn terminal_resize(
    state: State<'_, TerminalState>,
    id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let sessions = state.sessions.lock();

    if let Some(session) = sessions.get(&id) {
        session
            .master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to resize terminal: {}", e))?;
        Ok(())
    } else {
        Err(format!("Terminal {} not found", id))
    }
}

/// Close a terminal
#[tauri::command]
pub async fn terminal_close(
    state: State<'_, TerminalState>,
    id: String,
) -> Result<(), String> {
    let mut sessions = state.sessions.lock();
    sessions.remove(&id);
    Ok(())
}

/// List all active terminals
#[tauri::command]
pub async fn terminal_list(
    state: State<'_, TerminalState>,
) -> Result<Vec<String>, String> {
    let sessions = state.sessions.lock();
    Ok(sessions.keys().cloned().collect())
}
