use crate::cli::{cli_date_now, cli_design, cli_help_command, cli_show_dir};
use crate::json::{delete_json_file, fetch_json, format_json, get_json_file, list_json_files, perform_search, save_json_file};
use crate::ollama::{list_of_models, ollama_api_call};
use crate::ui_helpers::{pick_json_file, save_json_as_file};
use tauri::{generate_context, Builder};
use tauri_plugin_dialog::init;

mod cli;
mod json;
mod ollama;
mod ui_helpers;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            cli_help_command,
            cli_date_now,
            cli_show_dir,
            cli_design,
            fetch_json,
            format_json,
            ollama_api_call,
            pick_json_file,
            list_of_models,
            save_json_as_file,
            save_json_file,
            list_json_files,
            get_json_file,
            delete_json_file,
            perform_search
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}
