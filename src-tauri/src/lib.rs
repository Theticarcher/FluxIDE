mod commands;

use commands::terminal::TerminalState;
#[cfg(debug_assertions)]
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(TerminalState::default())
        .invoke_handler(tauri::generate_handler![
            commands::file_system::read_directory,
            commands::file_system::read_file,
            commands::file_system::write_file,
            commands::file_system::create_file,
            commands::file_system::create_directory,
            commands::file_system::delete_path,
            commands::file_system::rename_path,
            commands::compiler::compile_flux_file,
            commands::terminal::terminal_spawn,
            commands::terminal::terminal_write,
            commands::terminal::terminal_resize,
            commands::terminal::terminal_close,
            commands::terminal::terminal_list,
        ])
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                let window = _app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
