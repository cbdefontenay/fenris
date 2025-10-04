use fs::{read_to_string, write};
use std::fs;
use tauri::{command, AppHandle};
use tauri::async_runtime::spawn_blocking;
use tauri_plugin_dialog::DialogExt;

#[command]
pub async fn pick_json_file(app: AppHandle) -> Result<String, String> {
    let result = spawn_blocking(move || {
        app.dialog()
            .file()
            .add_filter("JSON File", &["json"])
            .blocking_pick_file()
    })
    .await
    .map_err(|e| format!("Failed to spawn blocking task: {}", e))?;

    match result {
        Some(file_path) => {
            // Convert FilePath to string path
            let path_string = file_path.to_string();
            let content =
                read_to_string(&path_string).map_err(|e| format!("Failed to read file: {}", e))?;
            Ok(content)
        }
        None => Err("No file selected".to_string()),
    }
}

#[command]
pub async fn save_json_as_file(app: AppHandle, json_string: String) -> Result<(), String> {
    let result = spawn_blocking(move || {
        app.dialog()
            .file()
            .add_filter("JSON File", &["json"])
            .blocking_save_file()
    })
    .await
    .map_err(|e| format!("Failed to spawn blocking task: {}", e))?;

    match result {
        Some(file_path) => {
            let path_string = file_path.to_string();
            // Write the JSON content to the file
            write(&path_string, json_string).map_err(|e| format!("Failed to write file: {}", e))?;
            Ok(())
        }
        None => Err(String::from("No file selected")),
    }
}
