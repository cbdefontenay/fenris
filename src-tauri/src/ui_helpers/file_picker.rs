use fs::read_to_string;
use tauri::{command, AppHandle};
use tauri_plugin_dialog::DialogExt;
use std::fs;

#[command]
pub fn pick_json_file(app: AppHandle) -> Result<String, String> {
    let file_path = app.dialog()
        .file()
        .add_filter("JSON Files", &["json"])
        .blocking_pick_file()
        .ok_or("No file selected")?;

    let path_string = file_path.to_string();
    let content = read_to_string(&path_string)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    Ok(content)
}