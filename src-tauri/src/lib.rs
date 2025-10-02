use crate::cli::{cli_date_now, cli_help_command, cli_show_dir};
use crate::json::{fetch_json, format_json};
use tauri::{generate_context, Builder};
use crate::ollama::{list_of_models, ollama_api_call};
use crate::ui_helpers::pick_json_file;

mod cli;
mod json;
mod ollama;
mod ui_helpers;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            cli_help_command,
            cli_date_now,
            cli_show_dir,
            fetch_json,
            format_json,
            ollama_api_call,
            pick_json_file,
            list_of_models
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}
