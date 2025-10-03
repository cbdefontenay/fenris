use reqwest::Client;
use serde_json::{from_str, to_string_pretty, Value};
use tauri::{command, AppHandle};
use tauri_plugin_store::StoreExt;

#[command]
pub async fn fetch_json(url: String) -> Result<String, String> {
    let client = Client::new();

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    // Parse and pretty-print the JSON
    let parsed_json: Value =
        from_str(&response_text).map_err(|e| format!("Response is not valid JSON: {}", e))?;

    to_string_pretty(&parsed_json).map_err(|e| format!("Failed to format JSON: {}", e))
}

#[command]
pub fn format_json(json_string: String) -> Result<String, String> {
    let parsed_json: Value = from_str(&json_string).map_err(|e| format!("Invalid JSON: {}", e))?;

    to_string_pretty(&parsed_json).map_err(|e| format!("Failed to format JSON: {}", e))
}

#[command]
pub fn save_json_file(app: AppHandle, key: String, value: String) -> Result<(), String> {
    let store = app.store("store.json").map_err(|e| e.to_string())?;

    // Parse the value to ensure it is valid JSON before storing
    let parsed_value: Value = from_str(&value).map_err(|e| format!("Invalid JSON: {}", e))?;

    store.set(key, parsed_value);
    Ok(())
}

#[command]
pub fn list_json_files(app: AppHandle) -> Result<Vec<String>, String> {
    let store = app.store("store.json").map_err(|e| e.to_string())?;
    Ok(store.keys().into_iter().collect())
}

#[command]
pub fn get_json_file(app: AppHandle, key: String) -> Result<String, String> {
    let store = app.store("store.json").map_err(|e| e.to_string())?;
    match store.get(&key) {
        Some(value) => {
            to_string_pretty(&value).map_err(|e| format!("Failed to format JSON: {}", e))
        }
        None => Err(String::from("File not found")),
    }
}

#[command]
pub fn delete_json_file(app: AppHandle, key: String) -> Result<(), String> {
    let store = app.store("store.json").map_err(|e| e.to_string())?;
    store.delete(&key);
    store
        .save()
        .map_err(|e| format!("Failed to save store: {}", e))?;
    Ok(())
}
