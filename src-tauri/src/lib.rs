use crate::cli::{
    cli_date_now, cli_date_without_hours, cli_design, cli_help_command, cli_show_dir,
};
use crate::json::{
    delete_json_file, fetch_json, format_json, get_json_file, list_json_files, perform_search,
    save_json_file,
};
use crate::ollama::{list_of_models, ollama_api_call};
use crate::sqlite::{create_single_note, delete_folder_and_note_sqlite, delete_folder_by_name_sqlite, delete_folder_sqlite, delete_single_note, get_all_folders, get_all_single_note, get_notes_by_folder_sqlite, save_folder_sqlite, save_note_to_folder_sqlite, sqlite_migrations, update_folder_by_id_sqlite, update_folder_by_name_sqlite, update_folder_sqlite, update_single_note};
use crate::ui_helpers::{
    delete_folder_dialog, delete_single_note_dialog, pick_json_file, save_json_as_file,
};
use tauri::{generate_context, Builder};
use tauri_plugin_dialog::init;

mod cli;
mod json;
mod ollama;
mod sqlite;
mod ui_helpers;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:fenris_app_notes.db", sqlite_migrations())
                .build(),
        )
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
            delete_single_note_dialog,
            perform_search,
            cli_date_without_hours,
            delete_folder_dialog,
            delete_single_note,
            update_single_note,
            save_folder_sqlite,
            delete_folder_sqlite,
            delete_folder_and_note_sqlite,
            update_folder_sqlite,
            update_folder_by_name_sqlite,
            update_folder_by_id_sqlite,
            delete_folder_by_name_sqlite,
            get_all_folders,
            get_all_single_note,
            save_note_to_folder_sqlite,
            get_notes_by_folder_sqlite,
            create_single_note
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}
