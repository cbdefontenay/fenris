use fs::{read_to_string, write};
use tauri::{command, AppHandle};
use tauri_plugin_dialog::DialogExt;
use std::fs;

#[command]
pub fn pick_json_file(app: AppHandle) -> Result<String, String> {
    let file_path = app.dialog()
        .file()
        .add_filter("JSON File", &["json"])
        .blocking_pick_file()
        .ok_or("No file selected")?;

    let path_string = file_path.to_string();
    let content = read_to_string(&path_string)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    Ok(content)
}

#[command]
pub fn save_json_as_file(app: AppHandle, json_string: String) -> Result<(), String> {
    let file_path = app.dialog()
        .file()
        .add_filter("JSON File", &["json"])
        .blocking_save_file()
        .ok_or("No file selected")?;

    // Convert FilePath to a string path
    let path_string = file_path.to_string();

    // Write the JSON content to the file
    write(&path_string, json_string)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}