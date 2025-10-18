use serde_json::Value;
use tauri::{command, AppHandle, Manager};
use tauri_plugin_store::StoreBuilder;

#[command]
pub async fn set_theme(app: AppHandle, code_theme: String) -> Result<(), String> {
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("theme.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    store.set("code-theme", Value::String(code_theme));

    store
        .save()
        .map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(())
}

#[command]
pub async fn get_theme(app: AppHandle) -> Result<String, String> {
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("theme.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    match store.get("code-theme") {
        Some(Value::String(theme)) => Ok(theme.clone()),
        _ => Ok("atomDark".to_string()),
    }
}