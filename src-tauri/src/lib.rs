use crate::cli::{
    cli_date_now, cli_date_without_hours, cli_design, cli_help_command, cli_show_dir,
};
use crate::json::{
    delete_json_file, fetch_json, format_json, get_json_file, list_json_files, perform_search,
    save_json_file,
};
use crate::ollama::{list_of_models, ollama_api_call};
use crate::sqlite::{
    create_single_note, delete_folder_and_note_sqlite, delete_folder_by_name_sqlite,
    delete_folder_sqlite, delete_single_note, get_all_folders, get_all_single_note,
    get_note_by_id_sqlite, get_notes_by_folder_sqlite, get_single_note_by_id_sqlite,
    save_folder_sqlite, save_note_to_folder_sqlite, sqlite_migrations, update_folder_by_id_sqlite,
    update_folder_by_name_sqlite, update_folder_sqlite, update_note_content_sqlite,
    update_single_note, update_single_note_content_sqlite,
};
use crate::state::{
    auto_save_folder_note, auto_save_single_note, calculate, editor_state, get_add_note_state,
    get_folder_items_state, get_folder_note_by_id, get_folder_state, get_note_state,
    get_single_note_by_id, get_vec_history, is_markdown_full_screen, reset_add_note_state,
    reset_folder_items_state, reset_folder_state, reset_note_state, set_add_note_state,
    set_char_count_for_markdown, set_editor_state, set_folder_items_state, set_folder_name,
    set_markdown_content, set_note_name, set_vec_history, set_word_count_for_markdown,
    toggle_view_mode, update_add_note_field, update_folder_items_field, validate_folder_name,
    validate_note_name, AddNoteManager, AddNoteState, Counter, FolderItemsManager,
    FolderItemsState, FolderManager, FolderState, MarkdownPreviewManager, MarkdownState,
    NoteManager, NoteState, ShellManager, ShellState,
};
use crate::theme::{get_theme, list_of_themes, set_theme};
use crate::ui_helpers::{
    delete_folder_dialog, delete_single_note_dialog, pick_json_file, save_json_as_file,
};
use std::sync::Mutex;
use tauri::{generate_context, Builder};
use tauri_plugin_dialog::init;
use crate::store::{handle_shell_theme_command, store_and_get_theme, store_and_set_theme};

mod cli;
mod json;
mod ollama;
mod sqlite;
mod state;
mod store;
mod theme;
mod ui_helpers;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .manage(Counter {
            count: Mutex::new(0),
        })
        .manage(FolderManager {
            state: Mutex::new(FolderState::default()),
        })
        .manage(NoteManager {
            state: Mutex::new(NoteState::default()),
        })
        .manage(FolderItemsManager(Mutex::new(FolderItemsState::default())))
        .manage(AddNoteManager(Mutex::new(AddNoteState::default())))
        .manage(MarkdownPreviewManager(Mutex::new(MarkdownState::default())))
        .manage(ShellManager {
            state: Mutex::new(ShellState::default()),
        })
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
            create_single_note,
            calculate,
            validate_folder_name,
            set_folder_name,
            reset_folder_state,
            get_folder_state,
            set_note_name,
            validate_note_name,
            reset_note_state,
            get_note_state,
            update_folder_items_field,
            reset_folder_items_state,
            set_folder_items_state,
            get_folder_items_state,
            get_add_note_state,
            set_add_note_state,
            update_add_note_field,
            reset_add_note_state,
            set_markdown_content,
            toggle_view_mode,
            editor_state,
            set_editor_state,
            update_note_content_sqlite,
            update_single_note_content_sqlite,
            get_note_by_id_sqlite,
            get_single_note_by_id_sqlite,
            auto_save_folder_note,
            auto_save_single_note,
            get_folder_note_by_id,
            get_single_note_by_id,
            set_vec_history,
            get_vec_history,
            set_theme,
            get_theme,
            list_of_themes,
            set_word_count_for_markdown,
            set_char_count_for_markdown,
            is_markdown_full_screen,
            store_and_set_theme,
            store_and_get_theme,
            handle_shell_theme_command
        ])
        .run(generate_context!())
        .expect("error while running Fenris application");
}
