use std::collections::HashMap;
use serde_json::Value;
use tauri::{command, AppHandle, Manager};
use tauri_plugin_store::StoreBuilder;

#[command]
pub async fn store_and_set_theme(app: AppHandle, app_theme: String) -> Result<String, String> {
    let valid_themes = vec!["light", "dark", "nord"];

    if !valid_themes.contains(&app_theme.as_str()) {
        return Err(format!("Invalid theme: {}. Available themes: {}", app_theme, valid_themes.join(", ")));
    }

    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("store-theme.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    store.set("app-theme", Value::String(app_theme.clone()));

    store
        .save()
        .map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(app_theme)
}

#[command]
pub async fn handle_shell_theme_command(app: AppHandle, theme_arg: String) -> Result<String, String> {
    let theme_map: HashMap<&str, &str> = [
        ("light", "light"),
        ("dark", "dark"),
        ("nord", "nord"),
    ].iter().cloned().collect();

    let normalized_theme = theme_arg.to_lowercase();

    match theme_map.get(normalized_theme.as_str()) {
        Some(&theme) => {
            store_and_set_theme(app, theme.to_string()).await?;

            let message = match theme {
                "light" => "Theme auf Hell gesetzt",
                "dark" => "Theme auf Dunkel gesetzt",
                "nord" => "Theme auf Nord gesetzt",
                _ => "Theme geändert"
            };
            Ok(message.to_string())
        }
        None => {
            let available: Vec<&str> = theme_map.values().copied().collect();
            Err(format!("Ungültiges Theme: {}. Verfügbar: {}", theme_arg, available.join(", ")))
        }
    }
}

#[command]
pub async fn store_and_get_theme(app: AppHandle) -> Result<String, String> {
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("store-theme.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    match store.get("app-theme") {
        Some(Value::String(theme)) => Ok(theme.clone()),
        _ => Ok("light".to_string()),
    }
}
