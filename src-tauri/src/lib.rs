use crate::cli::{cli_date_now, cli_help_command, cli_show_dir};
use crate::json::{fetch_json, format_json};
use tauri::{generate_context, Builder};

mod cli;
mod json;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            cli_help_command,
            cli_date_now,
            cli_show_dir,
            fetch_json,
            format_json
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}
