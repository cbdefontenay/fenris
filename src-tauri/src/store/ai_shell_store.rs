use serde_json::Value;
use tauri::{command, AppHandle, Manager};
use tauri_plugin_store::StoreBuilder;
use crate::ollama::list_of_models;

#[command]
pub async fn store_and_set_ai_model(app: AppHandle, app_ai_model: String) -> Result<String, String> {
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("ai-config.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    // Store the custom model
    store.set("ai-model", Value::String(app_ai_model.clone()));

    // Also store it in a list of custom models for future reference
    let custom_models = match store.get("custom-models") {
        Some(Value::Array(models)) => models
            .iter()
            .filter_map(|v| v.as_str().map(|s| s.to_string()))
            .collect::<Vec<String>>(),
        _ => Vec::new(),
    };

    // Add the new custom model if it's not already in the list
    if !custom_models.contains(&app_ai_model) {
        let mut updated_models = custom_models;
        updated_models.push(app_ai_model.clone());
        store.set("custom-models", Value::Array(
            updated_models.into_iter().map(Value::String).collect()
        ));
    }

    store
        .save()
        .map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(format!("AI model '{}' saved successfully", app_ai_model))
}

#[command]
pub async fn handle_shell_ai_model_command(app: AppHandle, ai_model_arg: String) -> Result<String, String> {
    let available_models = list_of_models();

    // Also check custom models from store
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("ai-config.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    let custom_models = match store.get("custom-models") {
        Some(Value::Array(models)) => models
            .iter()
            .filter_map(|v| v.as_str().map(|s| s.to_string()))
            .collect::<Vec<String>>(),
        _ => Vec::new(),
    };

    // Check if model is available in either built-in or custom models
    if !available_models.contains(&ai_model_arg) && !custom_models.contains(&ai_model_arg) {
        return Err(format!("Model '{}' is not available", ai_model_arg));
    }

    store_and_set_ai_model(app, ai_model_arg).await
}

#[command]
pub async fn store_and_get_ai_model(app: AppHandle) -> Result<String, String> {
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("ai-config.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    match store.get("ai-model") {
        Some(Value::String(model)) => Ok(model.clone()),
        _ => {
            // Return a default model if none is stored
            let default_model = "llama3".to_string();
            store_and_set_ai_model(app.clone(), default_model.clone()).await?;
            Ok(default_model)
        }
    }
}

#[command]
pub async fn get_available_models_with_custom(app: AppHandle) -> Result<Vec<String>, String> {
    let mut models = list_of_models();

    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("ai-config.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    if let Some(Value::Array(custom_models)) = store.get("custom-models") {
        for model in custom_models {
            if let Some(model_str) = model.as_str() {
                let model_string = model_str.to_string();
                // Only add if not already in the list
                if !models.contains(&model_string) {
                    models.push(model_string);
                }
            }
        }
    }

    models.sort();

    Ok(models)
}